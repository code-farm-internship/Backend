import { Router } from 'express';
import categoryRoutes from './category.routes';
import authRoutes from './auth.routes';
import vendorRoutes from './vendor.routes';
import formatRoutes from './format.routes';
import productRoutes from './product.routes';
import cartRoutes from './cart.routes';
import discountRoutes from './discount.routes';
import couponRoutes from './coupon.routes';

const router = Router();

router.use('/categories', categoryRoutes);
router.use('/auth', authRoutes);
router.use('/vendors', vendorRoutes);
router.use('/formats', formatRoutes);
router.use('/products', productRoutes);
router.use('/carts', cartRoutes);
router.use('/discounts', discountRoutes);
router.use('/coupons', couponRoutes);

export default router;
