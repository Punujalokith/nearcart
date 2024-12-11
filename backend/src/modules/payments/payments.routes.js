import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import * as controller from './payments.controller.js';

const router = Router();

// Stripe webhook — raw body, no auth (Stripe signs it)
router.post('/webhook', controller.stripeWebhook);

// Authenticated routes
router.post('/checkout',         authenticate, requireRole('BUYER'),  controller.createCheckout);
router.post('/connect/onboard',  authenticate, requireRole('VENDOR'), controller.connectOnboard);
router.get('/connect/status',    authenticate, requireRole('VENDOR'), controller.connectStatus);

export default router;
