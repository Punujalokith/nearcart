import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import * as controller from './orders.controller.js';

const router = Router();

router.use(authenticate);

router.post('/',               requireRole('BUYER'),  controller.createOrder);
router.get('/buyer/me',        requireRole('BUYER'),  controller.getBuyerOrders);
router.get('/vendor/me',       requireRole('VENDOR'), controller.getVendorOrders);
router.get('/:id',                                    controller.getOrderById);
router.patch('/:id/status',    requireRole('VENDOR'), controller.updateOrderStatus);

export default router;
