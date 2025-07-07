import { authController } from '@/controllers';
import { authenticate } from '@/middlewares/authenticateMiddleware';
import { Router } from 'express';

const router = Router();

// Đăng ký tài khoản
/**
 * @typedef UserRegisterInput
 * @property {string} username.required - Tên đăng nhập
 * @property {string} email.required - Email người dùng
 * @property {string} password.required - Mật khẩu
 * @property {string} provider - Provider (ví dụ: email)
 * @property {string} phoneNumber - Số điện thoại
 */

/**
 * @route POST /auth/register
 * @tags Auth
 * @summary Đăng ký tài khoản mới
 * @param {UserRegisterInput} body.body.required - Thông tin đăng ký
 * @return {object} 200 - Success response
 * @return {Error} 400 - Bad request
 */

router.post('/register', authController.register);

// Đăng nhập tài khoản
router.post('/login', authController.login);

//Đăng xuất tài khoản
router.get('/logout', authController.logout);

// Làm mới access token
router.get('/refresh', authController.refresh);

//Xac thuc email
router.post('/verify-email', authController.verifyEmail);

//Gui lai email
router.post('/resend-verification', authController.resendVerificationEmail);

export default router;
