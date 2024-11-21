import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import * as controller from './auth.controller.js';

const router = Router();

router.post('/register',   authLimiter, controller.register);
router.post('/login',      authLimiter, controller.login);
router.post('/refresh',    controller.refresh);
router.post('/logout',     controller.logout);
router.patch('/fcm-token', authenticate, controller.updateFcmToken);

export default router;
