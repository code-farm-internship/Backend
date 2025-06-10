import { CouponStatus, CouponTarget } from '@/constants/coupon';
import { BadRequestError, NotFoundError } from '@/error/customError';
import customResponse from '@/helpers/response';
import Cart from '@/models/Cart';
import Category from '@/models/Category';
import Coupon from '@/models/Coupon';
import ProductVariant from '@/models/ProductVariant';
import { ICart } from '@/types/cart';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import _ from 'lodash';

export const getUserCart = async (req: Request, res: Response, next: NextFunction) => {
    const now = new Date();
    const categoriesMap = new Map();
    // need ICart type for populate user coupon
    const foundedCart = await Cart.findOne({ userId: req.userId })
        .populate<ICart>([
            {
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
                                select: '-createdAt -updatedAt',
                                match: {
                                    endDate: { $gt: now },
                                },
                            },
                        ],
                    },
                ],
            },
            {
                path: 'userId',
                select: 'coupons',
            },
        ])
        .lean();

    const foundedCoupons = await Coupon.find({
        status: CouponStatus.ACTIVE,
        $or: [
            {
                target: CouponTarget.PUBLIC,
            },
            {
                target: CouponTarget.NEW_USER,
            },
        ],
    });

    let userCoupons = foundedCart?.userId.coupons || [];
    const uniqueCategoryIds = [...new Set(userCoupons.flatMap((coupon) => coupon.categories))];
    const categories = await Category.find({
        _id: {
            $in: uniqueCategoryIds,
        },
    }).lean();

    categories.forEach((cate) => {
        categoriesMap.set(cate._id.toString(), cate);
    });

    userCoupons = userCoupons.map((coupon) => {
        const categoriesPoplated = coupon.categories.map((cate) => {
            return categoriesMap.get(cate._id.toString());
        });
        return {
            ...coupon,
            categories: categoriesPoplated,
        };
    });
    const cart = _.omit(foundedCart, 'userId');
    const coupons = [...userCoupons, ...foundedCoupons];

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: {
                cart,
                coupons,
            },
            message: ReasonPhrases.OK,
            status: StatusCodes.OK,
        }),
    );
};

export const addItemToCart = async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const cart = await Cart.findOne({ userId: req.userId });
    const variants = await ProductVariant.findOne({ _id: body.variantId });
    const foundedCartItem = cart?.items.find((item) => item.variantId.toString() === body.variantId);

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
