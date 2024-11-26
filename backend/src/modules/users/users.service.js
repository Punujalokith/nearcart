import { z } from 'zod';
import prisma from '../../config/database.js';

const updateProfileSchema = z.object({
  name:  z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
});

const addressSchema = z.object({
  label:     z.string().min(1).max(50),
  line1:     z.string().min(1),
  line2:     z.string().optional(),
  city:      z.string().min(1),
  lat:       z.number(),
  lng:       z.number(),
  isDefault: z.boolean().default(false),
});

export async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true },
  });
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
}

export async function updateMe(userId, body) {
  const data = updateProfileSchema.parse(body);
  return prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true, role: true, phone: true },
  });
}

export async function listAddresses(userId) {
  return prisma.address.findMany({ where: { userId }, orderBy: { isDefault: 'desc' } });
}

export async function addAddress(userId, body) {
  const data = addressSchema.parse(body);

  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  return prisma.address.create({ data: { ...data, userId } });
}

export async function deleteAddress(userId, addressId) {
  const addr = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!addr) {
    const err = new Error('Address not found');
    err.statusCode = 404;
    throw err;
  }
  await prisma.address.delete({ where: { id: addressId } });
}
