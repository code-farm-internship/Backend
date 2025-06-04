import asyncHandler from '@/helpers/asyncHandler';
import { productService } from '@/services';
import { NextFunction, Request, Response } from 'express';

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
    return productService.createProduct(req, res);
});
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
    return productService.updateProduct(req, res);
});
export const createProductVariant = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return productService.createProductVariant(req, res, next);
});
export const getAllVariantsByProduct = asyncHandler(async (req: Request, res: Response) => {
    return productService.getVariantsByProduct(req, res);
});
export const updateProductVariant = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return productService.updateProductVariant(req, res, next);
});
export const getAllProducts = asyncHandler(async (req: Request, res: Response) => {
    return productService.getAllProducts(req, res);
});
export const getNewProducts = asyncHandler(async (req: Request, res: Response) => {
    return productService.getNewProducts(req, res);
});
export const getBestSeller = asyncHandler(async (req: Request, res: Response) => {
    return productService.getBestSeller(req, res);
});
export const getFeaturedProducts = asyncHandler(async (req: Request, res: Response) => {
    return productService.getFeaturedProducts(req, res);
});
export const getDetailProduct = asyncHandler(async (req: Request, res: Response) => {
    return productService.getDetailProduct(req, res);
});
export const hiddenProduct = asyncHandler(async (req: Request, res: Response) => {
    return productService.hiddenProduct(req, res);
});
