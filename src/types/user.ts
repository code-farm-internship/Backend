import { ROLE } from '@/constants/allowRoles';
import mongoose from 'mongoose';
import { ICoupon } from './coupon';

export interface IUserCoupon extends ICoupon {
    couponId: mongoose.Schema.Types.ObjectId;
    isUsed: boolean;
    usedAt: Date;
    collectedAt: Date;
}
export interface IUser extends Document {
    _id: mongoose.Schema.Types.ObjectId;
    username: string;
    email: string;
    phoneNumber?: string;
    role: ROLE;
    address?: string;
    avatar?: string;
    coupons: IUserCoupon[];
    createdAt: Date;
    updatedAt: Date;
}
