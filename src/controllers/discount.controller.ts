import asyncHandler from '@/helpers/asyncHandler';
import { discountService } from '@/services';
import { NextFunction, Request, Response } from 'express';

export const getAllDiscounts = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return discountService.getAllDiscounts(req, res, next);
});
export const getDetailDiscount = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return discountService.getDetailDiscount(req, res, next);
});

export const createDiscount = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return discountService.createDiscount(req, res, next);
});

export const deleteDiscount = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return discountService.deleteDiscount(req, res, next);
});

export const updateDiscount = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return discountService.updateDiscount(req, res, next);
});
