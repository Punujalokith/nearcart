import { z } from 'zod';

export const registerSchema = z.object({
  name:     z.string().min(2).max(100),
  email:    z.string().email(),
  password: z.string().min(8).max(72),
  role:     z.enum(['BUYER', 'VENDOR']).default('BUYER'),
});

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const fcmTokenSchema = z.object({
  fcmToken: z.string().min(1),
});
