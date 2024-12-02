import { z } from 'zod';

export const createProductSchema = z.object({
  name:        z.string().min(2).max(200),
  description: z.string().min(5),
  price:       z.number().positive(),
  stock:       z.number().int().min(0).default(0),
  categoryId:  z.string().uuid(),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  search:     z.string().optional(),
  categoryId: z.string().uuid().optional(),
  vendorId:   z.string().uuid().optional(),
  minPrice:   z.coerce.number().optional(),
  maxPrice:   z.coerce.number().optional(),
  lat:        z.coerce.number().optional(),
  lng:        z.coerce.number().optional(),
  radius:     z.coerce.number().default(50),
  page:       z.coerce.number().int().min(1).default(1),
  limit:      z.coerce.number().int().min(1).max(100).default(20),
});
