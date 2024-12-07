import { z } from 'zod';
import prisma from '../../config/database.js';
import { sendPushNotification } from '../../utils/fcm.js';

const createOrderSchema = z.object({
  addressId: z.string().uuid(),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity:  z.number().int().min(1),
    })
  ).min(1),
  notes: z.string().max(500).optional(),
});

const STATUS_TRANSITIONS = {
  PENDING:          ['CONFIRMED', 'CANCELLED'],
  CONFIRMED:        ['PREPARING', 'CANCELLED'],
  PREPARING:        ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED:        [],
  CANCELLED:        [],
  REFUNDED:         [],
};

const STATUS_MESSAGES = {
  CONFIRMED:        { title: 'Order Confirmed! 🎉',       body: 'Your order has been confirmed by the vendor.' },
  PREPARING:        { title: 'Order Being Prepared 👨‍🍳',  body: 'The vendor is preparing your order.' },
  OUT_FOR_DELIVERY: { title: 'Out for Delivery 🚴',       body: 'Your order is on its way!' },
  DELIVERED:        { title: 'Order Delivered ✅',         body: 'Your order has been delivered. Enjoy!' },
  CANCELLED:        { title: 'Order Cancelled ❌',         body: 'Your order has been cancelled.' },
};

export async function createOrder(buyerId, body) {
  const { addressId, items, notes } = createOrderSchema.parse(body);

  // Validate address belongs to buyer
  const address = await prisma.address.findFirst({ where: { id: addressId, userId: buyerId } });
  if (!address) {
    const err = new Error('Address not found');
    err.statusCode = 404;
    throw err;
  }

  // Load all products + validate they're from the same vendor
  const productIds = items.map((i) => i.productId);
  const products   = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });

  if (products.length !== productIds.length) {
    const err = new Error('One or more products are unavailable');
    err.statusCode = 400;
    throw err;
  }

  const vendorIds = [...new Set(products.map((p) => p.vendorId))];
  if (vendorIds.length > 1) {
    const err = new Error('All items in an order must be from the same vendor');
    err.statusCode = 400;
    throw err;
  }

  const vendorId = vendorIds[0];

  // Check stock
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (product.stock < item.quantity) {
      const err = new Error(`Insufficient stock for "${product.name}"`);
      err.statusCode = 400;
      throw err;
    }
  }

  // Calculate total
  const totalAmount = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + Number(product.price) * item.quantity;
  }, 0);

  // Create order + deduct stock in a transaction
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        buyerId,
        vendorId,
        addressId,
        notes,
        totalAmount,
        items: {
          create: items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            return {
              productId: item.productId,
              quantity:  item.quantity,
              unitPrice: product.price,
            };
          }),
        },
      },
      include: { items: { include: { product: true } }, vendor: true, address: true },
    });

    // Deduct stock
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data:  { stock: { decrement: item.quantity } },
      });
    }

    return newOrder;
  });

  return order;
}

export async function getOrderById(userId, orderId, role) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items:   { include: { product: { select: { id: true, name: true, imageUrls: true } } } },
      buyer:   { select: { id: true, name: true, email: true, phone: true } },
      vendor:  { select: { id: true, storeName: true } },
      address: true,
      tracking: true,
    },
  });

  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  // Access control
  const vendor = role === 'VENDOR' ? await prisma.vendor.findUnique({ where: { userId } }) : null;
  const isOwner = order.buyerId === userId || (vendor && order.vendorId === vendor.id) || role === 'ADMIN';

  if (!isOwner) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  return order;
}

export async function getBuyerOrders(buyerId) {
  return prisma.order.findMany({
    where:   { buyerId },
    include: {
      vendor: { select: { id: true, storeName: true, logoUrl: true } },
      items:  { include: { product: { select: { id: true, name: true, imageUrls: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getVendorOrders(userId) {
  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  if (!vendor) {
    const err = new Error('Vendor profile not found');
    err.statusCode = 404;
    throw err;
  }

  return prisma.order.findMany({
    where:   { vendorId: vendor.id },
    include: {
      buyer:  { select: { id: true, name: true, phone: true } },
      items:  { include: { product: { select: { id: true, name: true, imageUrls: true } } } },
      address: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateOrderStatus(userId, orderId, status) {
  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  if (!vendor) {
    const err = new Error('Vendor profile not found');
    err.statusCode = 403;
    throw err;
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, vendorId: vendor.id },
    include: { buyer: { select: { fcmToken: true } } },
  });

  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  const allowed = STATUS_TRANSITIONS[order.status] || [];
  if (!allowed.includes(status)) {
    const err = new Error(`Cannot move order from ${order.status} to ${status}`);
    err.statusCode = 400;
    throw err;
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data:  { status },
  });

  // Send FCM push to buyer
  if (order.buyer.fcmToken && STATUS_MESSAGES[status]) {
    await sendPushNotification({
      token: order.buyer.fcmToken,
      ...STATUS_MESSAGES[status],
      data: { orderId, status },
    });
  }

  return updated;
}
