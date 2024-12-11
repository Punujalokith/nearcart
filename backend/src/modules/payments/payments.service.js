import { z } from 'zod';
import prisma from '../../config/database.js';
import stripe from '../../config/stripe.js';

const checkoutSchema = z.object({
  orderId: z.string().uuid(),
});

export async function createCheckoutSession(buyerId, body) {
  const { orderId } = checkoutSchema.parse(body);

  const order = await prisma.order.findFirst({
    where:   { id: orderId, buyerId },
    include: { items: { include: { product: true } }, vendor: true },
  });

  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  if (order.status !== 'PENDING') {
    const err = new Error('Order is not in PENDING state');
    err.statusCode = 400;
    throw err;
  }

  const lineItems = order.items.map((item) => ({
    price_data: {
      currency:     'myr',
      unit_amount:  Math.round(Number(item.unitPrice) * 100), // cents
      product_data: { name: item.product.name },
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items:           lineItems,
    mode:                 'payment',
    success_url: `${process.env.CLIENT_URL}/orders/${orderId}?payment=success`,
    cancel_url:  `${process.env.CLIENT_URL}/orders/${orderId}?payment=cancelled`,
    metadata:    { orderId, buyerId },
    // Route payment to vendor's Stripe account if connected
    ...(order.vendor.stripeAccountId
      ? {
          payment_intent_data: {
            application_fee_amount: Math.round(Number(order.totalAmount) * 100 * 0.05), // 5% platform fee
            transfer_data: { destination: order.vendor.stripeAccountId },
          },
        }
      : {}),
  });

  // Save session ID on order
  await prisma.order.update({
    where: { id: orderId },
    data:  { stripeSessionId: session.id },
  });

  return { url: session.url, sessionId: session.id };
}

export async function handleWebhook(rawBody, signature) {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    const err = new Error('Webhook signature verification failed');
    err.statusCode = 400;
    throw err;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status:         'CONFIRMED',
          stripePaymentId: session.payment_intent,
        },
      });
    }
  }

  return { received: true };
}

export async function createConnectOnboarding(userId) {
  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  if (!vendor) {
    const err = new Error('Vendor profile not found');
    err.statusCode = 404;
    throw err;
  }

  let accountId = vendor.stripeAccountId;

  if (!accountId) {
    const account = await stripe.accounts.create({ type: 'express' });
    accountId = account.id;
    await prisma.vendor.update({
      where: { userId },
      data:  { stripeAccountId: accountId },
    });
  }

  const accountLink = await stripe.accountLinks.create({
    account:     accountId,
    refresh_url: `${process.env.CLIENT_URL}/settings/payouts`,
    return_url:  `${process.env.CLIENT_URL}/settings/payouts?connected=true`,
    type:        'account_onboarding',
  });

  return { onboardingUrl: accountLink.url };
}

export async function getConnectStatus(userId) {
  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  if (!vendor?.stripeAccountId) {
    return { connected: false };
  }

  const account = await stripe.accounts.retrieve(vendor.stripeAccountId);
  return {
    connected:       true,
    chargesEnabled:  account.charges_enabled,
    payoutsEnabled:  account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
  };
}
