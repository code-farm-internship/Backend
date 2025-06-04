import mongoose from 'mongoose';
import { NotFoundError } from '@/error/customError';
import { Request, Response, NextFunction, RequestHandler } from 'express';

export const validateObjectId: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    if (!req.params) {
        next(new NotFoundError(`Cần request params cho route này.`));
    }
    for (const param in req.params) {
        if (!mongoose.isValidObjectId(req.params[param])) {
            return next(new NotFoundError(`Param không hợp lệ: ${req.params[param]}`));
        }
        next();
    }
};
