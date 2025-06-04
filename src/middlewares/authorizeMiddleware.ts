import { UnAuthorizedError } from '@/error/customError';
import { NextFunction, Request, Response } from 'express';

export const authorize = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.role && !allowedRoles.includes(req.role)) {
            return next(new UnAuthorizedError('Bạn không có quyền truy cập!'));
        }
        next();
    };
};
