import asyncHandler from '@/helpers/asyncHandler';
import { discountService } from '@/services';
import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

export const getAllDiscounts = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return discountService.getAllDiscounts(req, res, next);
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
