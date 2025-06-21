import { BadRequestError, NotFoundError } from '@/error/customError';
import APIQuery from '@/helpers/apiQuery';
import customResponse from '@/helpers/response';
import Discount from '@/models/Discount';
import { discountSchema } from '@/validations/discount/discountSchema';
import { discountUpdateSchema } from '@/validations/discount/discountUpdateSchema';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

export const getAllDiscounts = async (req: Request, res: Response, next: NextFunction) => {
    const limit = req.params.limit ? +req.params.limit : 10;

    const features = new APIQuery(Discount.find(), req.query);
    features.filter().sort().limitFields().search().paginate();

    const [data, totalDocs] = await Promise.all([features.query, features.count()]);
    const totalPages = Math.ceil(totalDocs / limit);

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: {
                data,
                totalPages,
                totalDocs,
                limit,
            },
            message: ReasonPhrases.OK,
            status: StatusCodes.OK,
        }),
    );
};

export const getDetailDiscount = async (req: Request, res: Response, next: NextFunction) => {
    const discount = await Discount.findOne({ _id: req.params.id });

    if (!discount) {
        throw new NotFoundError('Không tim thấy giảm giá');
    }

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: discount,
            message: ReasonPhrases.OK,
            status: StatusCodes.OK,
        }),
    );
};

export const createDiscount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, value } = discountSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
        if (error) {
            throw new BadRequestError(error.details.map((d) => d.message).join(', '));
        }

        const newDiscount = await Discount.create(value);

        return res.status(StatusCodes.CREATED).json(
            customResponse({
                data: newDiscount,
                message: ReasonPhrases.CREATED,
                status: StatusCodes.CREATED,
            }),
        );
    } catch (error) {
        next(error);
    }
};

export const deleteDiscount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const deletedDiscount = await Discount.findByIdAndDelete(id);

        if (!deletedDiscount) {
            throw new NotFoundError('Discount không tồn tại');
        }
        return res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
        next(error);
    }
};

export const updateDiscount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        // Validate dữ liệu update (partial)
        const { error, value } = discountUpdateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
        if (error) {
            throw new BadRequestError(error.details.map((d) => d.message).join(', '));
        }

        // Cập nhật discount theo id, trả về bản mới nhất
        const updatedDiscount = await Discount.findByIdAndUpdate(id, value, { new: true });

        if (!updatedDiscount) {
            throw new NotFoundError('Discount không tồn tại');
        }

        return res.status(StatusCodes.OK).json(
            customResponse({
                data: updatedDiscount,
                message: ReasonPhrases.OK,
                status: StatusCodes.OK,
            }),
        );
    } catch (error) {
        next(error);
    }
};
