import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as controller from './users.controller.js';

const router = Router();

router.use(authenticate);

router.get('/me',               controller.getMe);
router.patch('/me',             controller.updateMe);
router.get('/me/addresses',     controller.listAddresses);
router.post('/me/addresses',    controller.addAddress);
router.delete('/me/addresses/:id', controller.deleteAddress);

export default router;
