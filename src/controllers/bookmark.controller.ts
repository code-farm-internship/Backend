import asyncHandler from '@/helpers/asyncHandler';
import { bookmarkService } from '@/services';
import { NextFunction, Request, Response } from 'express';

export const getAllBookmarks = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return bookmarkService.getAllBookmarks(req, res, next);
});

export const createBookmark = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return bookmarkService.createBookmark(req, res, next);
});

export const deleteBookmark = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return bookmarkService.deleteBookmark(req, res, next);
});
