import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import * as controller from './reviews.controller.js';

const router = Router();

router.post('/',                authenticate, requireRole('BUYER'), controller.createReview);
router.get('/product/:productId',                                   controller.getProductReviews);

export default router;
