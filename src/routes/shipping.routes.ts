import { shippingController } from '@/controllers';
import { Router } from 'express';

const router = Router();

router.get('/province', shippingController.getProvince);
router.get('/district/:id', shippingController.getDistrict);
router.get('/ward/:id', shippingController.getWard);

export default router;
