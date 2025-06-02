import { BadRequestError, NotFoundError } from '@/error/customError';
import customResponse from '@/helpers/response';
import Bookmark from '@/models/Bookmark';
import { BookmarkSchema } from '@/validations/bookmark/bookmarkSchema';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

export const getAllBookmarks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bookmarks = await Bookmark.find();
        return res.status(StatusCodes.OK).json(
            customResponse({
                data: bookmarks,
                message: ReasonPhrases.OK,
                status: StatusCodes.OK,
            }),
        );
    } catch (error) {
        next(error);
    }
};

export const createBookmark = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, value } = BookmarkSchema.validate(req.body, { abortEarly: false });
        if (error) {
            throw new BadRequestError(error.details.map((d) => d.message).join(', '));
        }

        // Check if bookmark already exists for same user and product (optional, depending on your business logic)
        const existing = await Bookmark.findOne({ userId: value.userId, productId: value.productId });
        if (existing) {
            throw new BadRequestError('Bookmark đã tồn tại');
        }

        const newBookmark = await Bookmark.create(value);
        return res.status(StatusCodes.CREATED).json(
            customResponse({
                data: newBookmark,
                message: ReasonPhrases.CREATED,
                status: StatusCodes.CREATED,
            }),
        );
    } catch (error) {
        next(error);
    }
};

export const deleteBookmark = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const deleted = await Bookmark.findByIdAndDelete(id);

        if (!deleted) {
            throw new NotFoundError('Bookmark không tồn tại');
        }

        return res.status(StatusCodes.NO_CONTENT).json(
            customResponse({
                data: null,
                message: ReasonPhrases.NO_CONTENT,
                status: StatusCodes.NO_CONTENT,
            }),
        );
    } catch (error) {
        next(error);
    }
};
