import { BadRequestError, NotFoundError } from '@/error/customError';
import customResponse from '@/helpers/response';
import Cart from '@/models/Cart';
import ProductVariant from '@/models/ProductVariant';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

export const getUserCart = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.userId);
    const cart = await Cart.findOne({ userId: req.userId }).populate({
        path: 'items',
        select: '-createdAt -updatedAt',
        populate: [
            {
                path: 'productId',
                select: 'name _id',
            },
            {
                path: 'variantId',
                select: '-createdAt -updatedAt -imageUrlRef',
                populate: [
                    {
                        path: 'formatId',
                        select: '-createdAt -updatedAt',
                    },
                    {
                        path: 'discountId',
                        select: '-createdAt -updatedAt -startDate -endDate',
                    },
                ],
            },
        ],
    });

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: cart,
            message: ReasonPhrases.OK,
            status: StatusCodes.OK,
        }),
    );
};

export const addItemToCart = async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const cart = await Cart.findOne({ userId: req.userId });
    const variants = await ProductVariant.findOne({ _id: body.variantId });
    const foundedCartItem = cart?.items.find(
        (item) => item.variantId.toString() === body.variantId,
    );

    if (!variants) {
        throw new BadRequestError('Sản phẩm này không tồn tại');
    }

    if (foundedCartItem) {
        const isOverStock = body.quantity + foundedCartItem.quantity > variants.stock;
        let quantity = body.quantity;

        if (isOverStock) {
            quantity = variants.stock;
        } else {
            quantity += foundedCartItem.quantity;
        }

        await Cart.updateOne(
            { userId: req.userId, 'items.variantId': body.variantId },
            {
                $set: {
                    'items.$.quantity': quantity,
                },
            },
        );
    } else {
        await Cart.updateOne(
            { userId: req.userId },
            {
                $push: {
                    items: {
                        variantId: body.variantId,
                        productId: body.productId,
                        quantity: body.quantity <= variants.stock ? body.quantity : variants.stock,
                    },
                },
            },
        );
    }

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: null,
            message: ReasonPhrases.OK,
            status: StatusCodes.OK,
        }),
    );
};

export const updateCartItemQuantity = async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const cart = await Cart.findOne({ userId: req.userId });
    const variants = await ProductVariant.findOne({ _id: body.variantId });
    const cartItem = cart?.items.find((item) => item.variantId.toString() === body.variantId);
    let message = '';
    let quantity = body.quantity;

    if (!cartItem || !variants) {
        throw new BadRequestError('Sản phẩm không tồn tại trong giỏ hàng');
    }

    if (quantity > variants.stock) {
        quantity = variants.stock;
        message = `Giới hạn sản phẩm là ${variants.stock}`;
    }

    await Cart.updateOne(
        { userId: req.userId },
        {
            $set: {
                'items.$[elem].quantity': quantity,
            },
        },
        {
            arrayFilters: [{ 'elem.variantId': body.variantId }],
        },
    );

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: null,
            message: message || ReasonPhrases.OK,
            status: StatusCodes.OK,
        }),
    );
};

export const removeCartItem = async (req: Request, res: Response, next: NextFunction) => {
    const foundedItem = await Cart.findOneAndUpdate(
        { userId: req.userId },
        {
            $pull: { items: { variantId: req.params.variantId } },
        },
    );

    if (!foundedItem) {
        throw new NotFoundError('Không tìm thấy sản phẩm trong giỏ hàng');
    }

    return res.status(StatusCodes.NO_CONTENT).json(
        customResponse({
            data: null,
            message: ReasonPhrases.NO_CONTENT,
            status: StatusCodes.NO_CONTENT,
        }),
    );
};
