import { z } from 'zod';
import prisma from '../../config/database.js';

const createReviewSchema = z.object({
  productId: z.string().uuid(),
  orderId:   z.string().uuid().optional(),
  rating:    z.number().int().min(1).max(5),
  comment:   z.string().max(1000).optional(),
});

export async function createReview(userId, body) {
  const data = createReviewSchema.parse(body);

  // If orderId provided, verify buyer received that order
  if (data.orderId) {
    const order = await prisma.order.findFirst({
      where: { id: data.orderId, buyerId: userId, status: 'DELIVERED' },
    });
    if (!order) {
      const err = new Error('You can only review products from delivered orders');
      err.statusCode = 403;
      throw err;
    }
  }

  // Prevent duplicate reviews for same product+order
  const existing = await prisma.review.findFirst({
    where: { productId: data.productId, userId, ...(data.orderId ? { orderId: data.orderId } : {}) },
  });
  if (existing) {
    const err = new Error('You already reviewed this product');
    err.statusCode = 409;
    throw err;
  }

  return prisma.review.create({
    data: { ...data, userId },
    include: { user: { select: { id: true, name: true } } },
  });
}

export async function getProductReviews(productId) {
  const reviews = await prisma.review.findMany({
    where:   { productId },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : null;

  return { reviews, avgRating, reviewCount: reviews.length };
}
