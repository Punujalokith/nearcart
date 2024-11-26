import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import * as controller from './vendors.controller.js';

const router = Router();

router.get('/',        controller.listVendors);
router.get('/me',      authenticate, controller.getMyVendor);
router.get('/:id',     controller.getVendorById);
router.post('/',       authenticate, controller.registerVendor);
router.patch('/me',    authenticate, requireRole('VENDOR'), controller.updateMyVendor);

export default router;
