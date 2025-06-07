import { CouponDiscountType, CouponStatus, CouponTarget, CouponType } from '@/constants/coupon';
import mongoose from 'mongoose';

export interface ICoupon extends mongoose.Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    code: string;
    description?: string;
    couponType: CouponType;
    target: CouponTarget;
    discountType: CouponDiscountType;
    discountValue: number;
    minOrderValue: number;
    maxDiscountValue: number;
    stock: number;
    usagePerUser: number;
    categories: mongoose.Types.ObjectId[];
    status: CouponStatus;
    isCategoryExcluded: boolean;
    startDate?: Date;
    endDate?: Date;
    expiredAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
