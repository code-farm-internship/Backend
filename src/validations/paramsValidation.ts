import { BadRequestError } from '@/error/customError';
import { NextFunction, Request, Response } from 'express';
import { ObjectSchema } from 'joi';

export const paramsValidator = (schema: ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error, value } = schema.validate(req.params, {
            abortEarly: false,
            allowUnknown: false,
            stripUnknown: true,
        });

        if (error) {
            const messages = error.details.map((err) => err.message).join(' ');
            return next(new BadRequestError(messages));
        }

        req.params = value;
        next();
    };
};
