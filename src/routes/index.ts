import { Router } from 'express';
import categoryRoutes from './category.routes';
import authRoutes from './auth.routes';
import vendorRoutes from './vendor.routes';
import formatRoutes from './format.routes';
import productRoutes from './product.routes';
import cartRoutes from './cart.routes';
import discountRoutes from './discount.routes';
import couponRoutes from './coupon.routes';
import shippingRoutes from './shipping.routes';
import orderRoutes from './order.routes';
import paymentRoutes from './payment.routes';

const router = Router();

router.use('/categories', categoryRoutes);
router.use('/auth', authRoutes);
router.use('/vendors', vendorRoutes);
router.use('/formats', formatRoutes);
router.use('/products', productRoutes);
router.use('/carts', cartRoutes);
router.use('/discounts', discountRoutes);
router.use('/coupons', couponRoutes);
router.use('/shippings', shippingRoutes);
router.use('/orders', orderRoutes);
router.use('/payment', paymentRoutes);

export default router;
