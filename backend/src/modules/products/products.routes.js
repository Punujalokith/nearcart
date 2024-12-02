import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { upload } from '../../middleware/upload.js';
import * as controller from './products.controller.js';

const router = Router();

router.get('/',     controller.listProducts);
router.get('/:id',  controller.getProductById);

router.post('/',
  authenticate, requireRole('VENDOR'),
  controller.createProduct
);
router.put('/:id',
  authenticate, requireRole('VENDOR'),
  controller.updateProduct
);
router.delete('/:id',
  authenticate, requireRole('VENDOR'),
  controller.deleteProduct
);
router.post('/:id/images',
  authenticate, requireRole('VENDOR'),
  upload.array('images', 5),
  controller.uploadImages
);

export default router;
