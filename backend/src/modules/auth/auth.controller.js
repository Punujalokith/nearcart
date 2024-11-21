import * as authService from './auth.service.js';
import { registerSchema, loginSchema, refreshSchema, fcmTokenSchema } from './auth.validation.js';

export async function register(req, res, next) {
  try {
    const data   = registerSchema.parse(req.body);
    const tokens = await authService.register(data);
    res.status(201).json(tokens);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const data   = loginSchema.parse(req.body);
    const tokens = await authService.login(data);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const tokens = await authService.refresh({ refreshToken });
    res.json(tokens);
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await authService.logout({ refreshToken });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function updateFcmToken(req, res, next) {
  try {
    const { fcmToken } = fcmTokenSchema.parse(req.body);
    await authService.updateFcmToken(req.user.sub, fcmToken);
    res.json({ message: 'FCM token updated' });
  } catch (err) {
    next(err);
  }
}
