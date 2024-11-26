import { z } from 'zod';
import prisma from '../../config/database.js';
import { haversineDistance } from '../../utils/haversine.js';

const registerVendorSchema = z.object({
  storeName:   z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  city:        z.string().max(100).optional(),
  lat:         z.number().optional(),
  lng:         z.number().optional(),
});

const updateVendorSchema = registerVendorSchema.partial();

export async function listVendors({ lat, lng, radius = 50 }) {
  const vendors = await prisma.vendor.findMany({
    where: { isApproved: true },
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { products: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (lat && lng) {
    return vendors
      .map((v) => ({
        ...v,
        distance:
          v.lat && v.lng
            ? Math.round(haversineDistance(lat, lng, v.lat, v.lng) * 10) / 10
            : null,
      }))
      .filter((v) => v.distance === null || v.distance <= radius)
      .sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
  }

  return vendors;
}

export async function getVendorById(vendorId) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: {
      user: { select: { name: true, email: true } },
      products: {
        where: { isActive: true },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  if (!vendor) {
    const err = new Error('Vendor not found');
    err.statusCode = 404;
    throw err;
  }
  return vendor;
}

export async function registerVendor(userId, body) {
  const data = registerVendorSchema.parse(body);

  const existing = await prisma.vendor.findUnique({ where: { userId } });
  if (existing) {
    const err = new Error('You already have a vendor account');
    err.statusCode = 409;
    throw err;
  }

  // Promote user role to VENDOR
  await prisma.user.update({ where: { id: userId }, data: { role: 'VENDOR' } });

  return prisma.vendor.create({ data: { userId, ...data } });
}

export async function updateMyVendor(userId, body) {
  const data = updateVendorSchema.parse(body);
  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  if (!vendor) {
    const err = new Error('Vendor profile not found');
    err.statusCode = 404;
    throw err;
  }
  return prisma.vendor.update({ where: { userId }, data });
}

export async function getMyVendor(userId) {
  const vendor = await prisma.vendor.findUnique({
    where: { userId },
    include: { _count: { select: { products: true, orders: true } } },
  });
  if (!vendor) {
    const err = new Error('Vendor profile not found');
    err.statusCode = 404;
    throw err;
  }
  return vendor;
}
