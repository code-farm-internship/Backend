import { BadRequestError } from '@/error/customError';
import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

export const validator = (schema: Joi.Schema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true,
        });

        if (error) {
            const message = error.details.map((err) => err.message);
            return next(new BadRequestError(message.join(' ')));
        }
        req.body = value;
        next();
    };
};
