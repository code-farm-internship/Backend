import asyncHandler from '@/helpers/asyncHandler';
import { orderService } from '@/services';
import { Request, Response, NextFunction } from 'express';

export const createOrderCOD = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return orderService.createOrderCOD(req, res, next);
});

export const createOrderOnline = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return orderService.createOrderOnline(req, res, next);
});

export const getAllOrders = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  return orderService.getAllOrders(req, res, next);
});

export const getOrderDetail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  return orderService.getOrderDetail(req, res, next);
});

export const updateOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  return orderService.updateOrder(req, res, next);
});

export const cancelOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  return orderService.cancelOrder(req, res, next);
});

export const softDeleteOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  return orderService.softDeleteOrder(req, res, next);
});

export const restoreOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  return orderService.restoreOrder(req, res, next);
});

export const changeOrderStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return orderService.changeOrderStatus(req, res, next);
});
