import asyncHandler from '@/helpers/asyncHandler';
import { paymentService } from '@/services';
import { NextFunction, Request, Response } from 'express';

// Tạo URL thanh toán VNPay
export const createPaymentUrl = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return paymentService.createPaymentUrl(req, res, next);
});

// Xử lý callback từ VNPay
export const vnpayReturn = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return paymentService.vnpayReturn(req, res, next);
});

// Xử lý IPN từ VNPay
export const vnpayIpn = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return paymentService.vnpayIpn(req, res, next);
});

// Xử lý yêu cầu refund
export const refund = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return paymentService.refund(req, res, next);
});
