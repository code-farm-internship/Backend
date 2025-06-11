import { CouponStatus, CouponTarget, CouponType } from '@/constants/coupon';
import { BadRequestError, NotFoundError } from '@/error/customError';
import APIQuery from '@/helpers/apiQuery';
import customResponse from '@/helpers/response';
import Category from '@/models/Category';
import Coupon from '@/models/Coupon';
import User from '@/models/User';
import { isValidBodyCreateCoupon, isValidBodyUpdateCoupon } from '@/validations/coupon/coupon';
import { Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import _ from 'lodash';

//@[GET] admin
export const getAllCoupons = async (req: Request, res: Response) => {
    const limit = req.query.limit ? +req.query.limit : 10;
    const query = { ...req.query };

    const features = new APIQuery(Coupon.find({}), query);

    features.filter().sort().limitFields().search().paginate();

    const [coupons, totalDocs] = await Promise.all([features.query, features.count()]);
    const totalPage = Math.ceil(totalDocs / limit);

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: {
                coupons,
                limit,
                totalPage,
                totalDocs,
            },
            message: ReasonPhrases.OK,
            status: StatusCodes.OK,
        }),
    );
};
//@[GET]
export const getDetailCoupon = async (req: Request, res: Response) => {
    const code = req.params.code;

    const foundedCoupon = await Coupon.findOne({ code });

    if (!foundedCoupon) {
        throw new NotFoundError('Coupon không tồn tại');
    }

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: foundedCoupon,
            message: ReasonPhrases.OK,
            status: StatusCodes.OK,
        }),
    );
};
//@[GET]
export const getUserCoupons = async (req: Request, res: Response) => {
    const limit = req.query.limit ? +req.query.limit : 10;
    const page = req.query.page ? +req.query.page : 1;
    const query = req.query;

    const foundedCoupons = await User.findOne({ _id: req.userId }).select('coupons').lean();

    if (!foundedCoupons) {
        return res.status(StatusCodes.OK).json(
            customResponse({
                data: [],
                message: ReasonPhrases.OK,
                status: StatusCodes.OK,
            }),
        );
    }

    const filterCouponsData = foundedCoupons.coupons.filter((coupon) => {
        const isUsed = !coupon.isUsed;
        let searchName = true;
        let couponTypeFilter = true;
        let couponCategories = true;

        if (query.q && typeof query.q === 'string') {
            searchName = coupon.name.includes(query.q.toLowerCase());
        }

        if (query.type && typeof query.type === 'string') {
            couponTypeFilter = coupon.couponType === query.type;
        }

        if (query.categories && typeof query.categories === 'string' && query.categories.includes(',')) {
            const categoriesQueryArr = query.categories.split(',');

            couponCategories = coupon.categories.some((cate) => categoriesQueryArr.includes(cate._id.toString()));
        }

        return searchName && isUsed && couponTypeFilter && couponCategories;
    });

    const uniqueCategoryIds = [
        ...new Set(filterCouponsData.flatMap((coupon) => coupon.categories.map((cat) => cat._id.toString()))),
    ];

    const categoriesMap = new Map();

    if (uniqueCategoryIds.length > 0) {
        const categoriesData = await Category.find({ _id: { $in: uniqueCategoryIds } })
            .select('name')
            .lean();

        categoriesData.forEach((cat) => {
            categoriesMap.set(cat._id.toString(), cat);
        });
    }

    let couponAvailable = filterCouponsData.map((coupon) => {
        const populatedCategories = coupon.categories.map((cat) => categoriesMap.get(cat._id.toString()));

        return {
            ...coupon,
            categories: populatedCategories,
        };
    });

    const totalDocs = couponAvailable.length;
    const totalPages = Math.ceil(totalDocs / limit);
    const skip = (page - 1) * limit;
    const end = skip + limit;

    if (end >= couponAvailable.length) {
        couponAvailable = couponAvailable.slice(skip, couponAvailable.length);
    } else {
        couponAvailable = couponAvailable.slice(skip, end);
    }

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: {
                coupons: couponAvailable,
                limit,
                totalPages,
                totalDocs,
            },
            message: ReasonPhrases.OK,
            status: StatusCodes.OK,
        }),
    );
};
//@[GET]
export const getCollectetableCoupons = async (req: Request, res: Response) => {
    const now = new Date();

    const coupons = await Coupon.find({
        couponType: CouponTarget.COLLECTABLE,
        status: CouponStatus.ACTIVE,
        startDate: {
            $match: {
                $lte: now,
            },
        },
        endDate: {
            $match: {
                $gt: now,
            },
        },
    });

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: coupons,
            message: ReasonPhrases.OK,
            status: StatusCodes.OK,
        }),
    );
};

//@[PACTH]
export const collectCoupon = async (req: Request, res: Response) => {
    const id = req.params.id;
    const foundedCoupon = await Coupon.findById(id);

    if (!foundedCoupon || (foundedCoupon && foundedCoupon.status === CouponStatus.INACTIVE)) {
        throw new NotFoundError('Coupon không tồn tại!');
    }

    if (foundedCoupon.stock < 0) {
        throw new BadRequestError('Coupon đã hết số lượt có thể nhặt!');
    }

    const couponExist = await User.findOne({ _id: req.userId, 'coupons.couponId': id });
    const payload = {
        couponId: foundedCoupon._id,
        name: foundedCoupon.name,
        couponType: foundedCoupon.couponType,
        discountType: foundedCoupon.discountType,
        discountValue: foundedCoupon.discountValue,
        minOrderValue: foundedCoupon.minOrderValue,
        maxDiscountValue: foundedCoupon.maxDiscountValue,
        categories: foundedCoupon.categories,
        isCategoryExcluded: foundedCoupon.isCategoryExcluded,
        expiredAt: foundedCoupon.expiredAt,
    };

    if (couponExist) {
        await User.updateOne(
            { _id: req.userId },
            {
                $set: {
                    'coupons.$[elem].expiredAt': foundedCoupon.expiredAt,
                },
            },
            {
                arrayFilters: [{ 'elem.couponId': foundedCoupon._id }],
            },
        );
    } else {
        await User.updateOne(
            { _id: req.userId },
            {
                $push: {
                    coupons: payload,
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

//@[POST]
export const createCoupon = async (req: Request, res: Response) => {
    const body = req.body;
    const nameToLowerCase = body.name.toLowerCase();
    const foundedCoupon = await Coupon.findOne({ name: nameToLowerCase });

    if (foundedCoupon) {
        throw new BadRequestError('Tên coupon đã tồn tại!');
    }

    body.name = nameToLowerCase;

    isValidBodyCreateCoupon(body);

    const coupon = new Coupon(body);

    await coupon.save();

    return res.status(StatusCodes.CREATED).json(
        customResponse({
            data: coupon,
            message: ReasonPhrases.CREATED,
            status: StatusCodes.CREATED,
        }),
    );
};

//@[PUT]
export const updateCoupon = async (req: Request, res: Response) => {
    const couponId = req.params.id;
    const body = req.body;
    const foundedCoupon = await Coupon.findById(couponId);

    if (!foundedCoupon) {
        throw new NotFoundError('Coupon không tồn tại');
    }

    if (_.isMatch(foundedCoupon, body)) {
        return res.status(StatusCodes.OK).json(
            customResponse({
                data: {
                    message: 'Coupon không có sự thay đổi nào cả',
                },
                message: ReasonPhrases.OK,
                status: StatusCodes.OK,
            }),
        );
    }

    isValidBodyUpdateCoupon(foundedCoupon, body);

    Object.assign(foundedCoupon, body);

    await foundedCoupon.save();

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: foundedCoupon,
            message: ReasonPhrases.OK,
            status: StatusCodes.OK,
        }),
    );
};

//@[PACTH]
export const changeStatusCoupon = async (req: Request, res: Response) => {
    const id = req.params.id;

    const foundedCoupon = await Coupon.findById(id);

    if (!foundedCoupon) {
        throw new NotFoundError('Coupon không tồn tại');
    }
    foundedCoupon.status = foundedCoupon.status === CouponStatus.ACTIVE ? CouponStatus.INACTIVE : CouponStatus.ACTIVE;

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: foundedCoupon,
            message: ReasonPhrases.OK,
            status: StatusCodes.OK,
        }),
    );
};

//@[SERVICE]
/**
 * Xác thực coupon
 * @param coupon Coupon cần xác thực
 * @param userId ID người dùng
 * @param cart Tổng đơn hàng / sản phẩm... 
 */
export const validateCoupon = async (coupon: any, userId: string, cart: any) => {
  // TODO
};

/**
 * Tính toán giá trị giảm giá từ coupon
 * @param coupon Coupon đang áp dụng
 * @param cart Tổng đơn hàng / sản phẩm...
 */
export const calculateDiscount = (coupon: any, cart: any) => {
  // TODO: 
};
