import config from '@/config/env.config';
import { ROLE } from '@/constants/allowRoles';
import mongoose, { Schema } from 'mongoose';
import Cart from './Cart';
import { IUser, IUserCoupon } from '@/types/user';
import { CouponDiscountType, CouponType } from '@/constants/coupon';

const couponSchema = new Schema<IUserCoupon>(
    {
        couponId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Coupon',
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        code: {
            type: String,
            trim: true,
            required: true,
        },
        couponType: {
            type: String,
            enum: Object.values(CouponType),
            required: true,
        },
        discountType: {
            type: String,
            enum: Object.values(CouponDiscountType),
            required: true,
        },
        discountValue: {
            type: Number,
            min: 1,
            required: true,
        },
        minOrderValue: {
            type: Number,
            min: 0,
            required: true,
        },
        maxDiscountValue: {
            type: Number,
            min: 0,
        },
        categories: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Category',
                },
            ],

            default: [],
        },
        isCategoryExcluded: {
            type: Boolean,
            default: false,
        },
        expiredAt: {
            type: Date,
            default: Date.now,
            required: true,
        },
        isUsed: {
            type: Boolean,
            default: false,
        },
        usedAt: {
            type: Date,
            default: null,
        },
    },
    {
        _id: false,
        versionKey: false,
        timestamps: false,
    },
);

const userSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            trim: true,
            unique: true,
            required: true,
        },
        phoneNumber: {
            type: String,
        },
        role: {
            type: String,
            enum: Object.values(ROLE),
            default: ROLE.USER,
        },
        address: {
            type: String,
        },
        avatar: {
            type: String,
        },
        coupons: {
            type: [couponSchema],
            default: [],
        },
    },
    {
        versionKey: false,
        timestamps: true,
    },
);

userSchema.pre('save', async function (next) {
    if (this.isNew) {
        const host = config.host || 'http://localhost:8000';
        this.avatar = `${host}/images/anhdd.png`;
        await Cart.create({ userId: this._id });
    }
    next();
});

const User = mongoose.model('User', userSchema);
export default User;
