import { ROLE } from '@/constants/allowRoles';
import { couponController } from '@/controllers';
import { authenticate } from '@/middlewares/authenticateMiddleware';
import { authorize } from '@/middlewares/authorizeMiddleware';
import { createCouponSchema, updateCouponSchema } from '@/validations/coupon/couponSchema';
import { validator } from '@/validations/schemaValidator';
import { Router } from 'express';

const router = Router();

// GET
router.get('/all', authenticate, authorize(ROLE.ADMIN), couponController.getAllCoupons);
router.get('/me', authenticate, couponController.getUserCoupons);
router.get('/collect/:id', authenticate, couponController.collectCoupon);
router.get('/:code', authenticate, couponController.getDetailCoupon);

// POST
router.post(
    '/create',
    authenticate,
    authorize(ROLE.ADMIN),
    validator(createCouponSchema),
    couponController.createCoupon,
);

// PUT
router.put(
    '/update/:id',
    authenticate,
    authorize(ROLE.ADMIN),
    validator(updateCouponSchema),
    couponController.updateCoupon,
);
// PACTH
router.patch('/collectable', authenticate, couponController.getCollectableCoupons);
router.patch(
    '/change-status/:id',
    authenticate,
    authorize(ROLE.ADMIN),
    couponController.changeStatusCoupon,
);

export default router;
