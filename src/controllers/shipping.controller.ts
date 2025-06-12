import asyncHandler from '@/helpers/asyncHandler';
import { shippingService } from '@/services';
import { Request, Response } from 'express';

export const getProvince = asyncHandler(async (req: Request, res: Response) => {
    return shippingService.getProvince(req, res);
});
export const getDistrict = asyncHandler(async (req: Request, res: Response) => {
    return shippingService.getDistrict(req, res);
});
export const getWard = asyncHandler(async (req: Request, res: Response) => {
    return shippingService.getWard(req, res);
});
