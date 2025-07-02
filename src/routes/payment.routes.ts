import { paymentController } from '@/controllers';
import { authenticate } from '@/middlewares/authenticateMiddleware';
import { Router } from 'express';

const router = Router();

// Tạo URL thanh toán VNPay
router.post('/create_payment_url', paymentController.createPaymentUrl); // CREATE_PAYMENT_URL

// Xử lý callback từ VNPay
router.get('/vnpay_return', paymentController.vnpayReturn); // VNPAY_RETURN

// Xử lý IPN từ VNPay
router.get('/vnpay_ipn', paymentController.vnpayIpn); // VNPAY_IPN

// Yêu cầu refund VNPay
router.post('/refund', paymentController.refund); // REFUND

export default router;
