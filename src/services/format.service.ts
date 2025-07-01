import { BadRequestError, NotFoundError } from '@/error/customError';
import APIQuery from '@/helpers/apiQuery';
import customResponse from '@/helpers/response';
import Format from '@/models/Format';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import _ from 'lodash';

export const createFormat = async (req: Request, res: Response, next: NextFunction) => {
    const name = req.body.name.toLowerCase();
    const formatFounded = await Format.findOne({ name });

    if (formatFounded) {
        throw new BadRequestError('Tên của định dạng đã tồn tại');
    }

    const format = new Format({ name });

    await format.save();

    return res.status(StatusCodes.CREATED).json(
        customResponse({
            data: format,
            message: ReasonPhrases.CREATED,
            status: StatusCodes.CREATED,
        }),
    );
};

export const getAllFormats = async (req: Request, res: Response, next: NextFunction) => {
    const limit = req.params.limit ? req.params.limit : 10;
    const feature = new APIQuery(Format.find().lean(), req.query);

    feature.filter().search().sort().limitFields().paginate();

    const [data, totalDocs] = await Promise.all([feature.query, feature.count()]);
    const totalPage = Math.ceil(totalDocs / Number(limit));

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: {
                data,
                limit,
                totalDocs,
                totalPage,
            },
            message: ReasonPhrases.OK,
            status: StatusCodes.OK,
        }),
    );
};

export const getDetailFormat = async (req: Request, res: Response, next: NextFunction) => {
    const format = await Format.findById(req.params.id).lean();

    if (!format) {
        throw new NotFoundError(`Không tìm thấy định dạng với id ${req.params.id}`);
    }

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: format,
            message: ReasonPhrases.OK,
            status: StatusCodes.OK,
        }),
    );
};

export const updateFormat = async (req: Request, res: Response, next: NextFunction) => {
    const foundedFormat = await Format.findById(req.params.id);
    const name = req.body.name.toLowerCase();

    if (!foundedFormat) {
        throw new NotFoundError(`Không tìm thấy định dạng với id ${req.params.id}`);
    }

    if (foundedFormat._id.toString() !== req.params.id) {
        throw new BadRequestError(`Tên định dạng đã tồn tại`);
    }

    if (_.isMatch(foundedFormat, req.body)) {
        return res.status(StatusCodes.NO_CONTENT).json(
            customResponse({
                data: foundedFormat,
                message: ReasonPhrases.NO_CONTENT,
                status: StatusCodes.NO_CONTENT,
            }),
        );
    }
    const newFormat = new Format({ name });

    await newFormat.save();

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: foundedFormat,
            message: ReasonPhrases.OK,
            status: StatusCodes.OK,
        }),
    );
};
