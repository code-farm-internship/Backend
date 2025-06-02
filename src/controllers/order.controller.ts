import asyncHandler from '@/helpers/asyncHandler';
import { orderService } from '@/services';
import { Request, Response, NextFunction } from 'express';

export const createOrderCOD = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return orderService.createOrderCOD(req, res, next);
});

export const createOrderOnline = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return orderService.createOrderOnline(req, res, next);
});

export const changeOrderStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return orderService.changeOrderStatus(req, res, next);
});
