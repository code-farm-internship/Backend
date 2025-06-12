import asyncHandler from '@/helpers/asyncHandler';
import { couponService } from '@/services';
import { Request, Response } from 'express';

export const getAllCoupons = asyncHandler(async (req: Request, res: Response) => {
    return couponService.getAllCoupons(req, res);
});
export const getDetailCoupon = asyncHandler(async (req: Request, res: Response) => {
    return couponService.getDetailCoupon(req, res);
});
export const getUserCoupons = asyncHandler(async (req: Request, res: Response) => {
    return couponService.getUserCoupons(req, res);
});
export const getCollectableCoupons = asyncHandler(async (req: Request, res: Response) => {
    return couponService.getCollectetableCoupons(req, res);
});
export const collectCoupon = asyncHandler(async (req: Request, res: Response) => {
    return couponService.collectCoupon(req, res);
});
export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
    return couponService.createCoupon(req, res);
});
export const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
    return couponService.updateCoupon(req, res);
});
export const changeStatusCoupon = asyncHandler(async (req: Request, res: Response) => {
    return couponService.changeStatusCoupon(req, res);
});
export const applyCoupon = asyncHandler(async (req: Request, res: Response) => {
    return couponService.applyCoupon(req, res);
});
