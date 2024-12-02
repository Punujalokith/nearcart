import prisma from '../../config/database.js';
import cloudinary from '../../config/cloudinary.js';
import { haversineDistance } from '../../utils/haversine.js';
import { createProductSchema, updateProductSchema, productQuerySchema } from './products.validation.js';

export async function listProducts(rawQuery) {
  const q = productQuerySchema.parse(rawQuery);
  const skip = (q.page - 1) * q.limit;

  const where = {
    isActive: true,
    ...(q.search     && { name: { contains: q.search, mode: 'insensitive' } }),
    ...(q.categoryId && { categoryId: q.categoryId }),
    ...(q.vendorId   && { vendorId: q.vendorId }),
    ...(q.minPrice !== undefined || q.maxPrice !== undefined
      ? {
          price: {
            ...(q.minPrice !== undefined && { gte: q.minPrice }),
            ...(q.maxPrice !== undefined && { lte: q.maxPrice }),
          },
        }
      : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        vendor:   { select: { id: true, storeName: true, city: true, lat: true, lng: true } },
        category: { select: { id: true, name: true, slug: true } },
        reviews:  { select: { rating: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: q.limit,
    }),
    prisma.product.count({ where }),
  ]);

  // Attach avg rating + distance
  let result = products.map((p) => {
    const avgRating =
      p.reviews.length > 0
        ? Math.round((p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length) * 10) / 10
        : null;

    const distance =
      q.lat && q.lng && p.vendor.lat && p.vendor.lng
        ? Math.round(haversineDistance(q.lat, q.lng, p.vendor.lat, p.vendor.lng) * 10) / 10
        : null;

    const { reviews, ...rest } = p;
    return { ...rest, avgRating, reviewCount: reviews.length, distance };
  });

  // Filter by distance if coordinates provided
  if (q.lat && q.lng) {
    result = result.filter((p) => p.distance === null || p.distance <= q.radius);
    result.sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
  }

  return {
    data: result,
    meta: { total, page: q.page, limit: q.limit, totalPages: Math.ceil(total / q.limit) },
  };
}

export async function getProductById(productId) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      vendor:   { select: { id: true, storeName: true, city: true, logoUrl: true } },
      category: true,
      reviews: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  const avgRating =
    product.reviews.length > 0
      ? Math.round((product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length) * 10) / 10
      : null;

  return { ...product, avgRating, reviewCount: product.reviews.length };
}

export async function createProduct(userId, body) {
  const data = createProductSchema.parse(body);

  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  if (!vendor) {
    const err = new Error('Vendor profile not found. Register as a vendor first.');
    err.statusCode = 403;
    throw err;
  }
  if (!vendor.isApproved) {
    const err = new Error('Your vendor account is pending approval');
    err.statusCode = 403;
    throw err;
  }

  return prisma.product.create({
    data: { ...data, vendorId: vendor.id, price: data.price },
    include: { category: true },
  });
}

export async function updateProduct(userId, productId, body) {
  const data = updateProductSchema.parse(body);
  await assertProductOwner(userId, productId);
  return prisma.product.update({
    where: { id: productId },
    data,
    include: { category: true },
  });
}

export async function deleteProduct(userId, productId) {
  await assertProductOwner(userId, productId);
  // Soft delete
  await prisma.product.update({ where: { id: productId }, data: { isActive: false } });
}

export async function uploadProductImages(userId, productId, files) {
  await assertProductOwner(userId, productId);

  const uploads = await Promise.all(
    files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'nearcart/products', resource_type: 'image' },
            (err, result) => (err ? reject(err) : resolve(result.secure_url))
          );
          stream.end(file.buffer);
        })
    )
  );

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { imageUrls: true } });
  const newUrls = [...(product?.imageUrls ?? []), ...uploads];

  return prisma.product.update({
    where: { id: productId },
    data:  { imageUrls: newUrls },
    select: { id: true, imageUrls: true },
  });
}

// ─── Helper ────────────────────────────────────────────────────────────────────

async function assertProductOwner(userId, productId) {
  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  if (!vendor) {
    const err = new Error('Vendor profile not found');
    err.statusCode = 403;
    throw err;
  }
  const product = await prisma.product.findFirst({ where: { id: productId, vendorId: vendor.id } });
  if (!product) {
    const err = new Error('Product not found or not yours');
    err.statusCode = 404;
    throw err;
  }
  return product;
}
