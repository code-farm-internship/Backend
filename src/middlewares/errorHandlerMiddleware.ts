import config from '@/config/env.config';
import { BadRequestFormError } from '@/error/customError';
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

const errorHandler: ErrorRequestHandler = (
    err,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const status = err.status || StatusCodes.INTERNAL_SERVER_ERROR;
    const message = err.message || ReasonPhrases.INTERNAL_SERVER_ERROR;
    const name = err.name || 'Error';
    const stack = config.env === 'development' ? err.stack : '';

    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof BadRequestFormError) {
        res.status(status).json({
            success: false,
            status,
            message,
            name,
            errors: err.errors,
        });
        return;
    }

    res.status(status).json({
        data: null,
        success: false,
        status: status,
        name: name,
        message: message,
        stack: stack,
    });
};

export default errorHandler;
