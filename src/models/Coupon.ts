import { CouponDiscountType, CouponStatus, CouponTarget, CouponType } from '@/constants/coupon';
import { ICoupon } from '@/types/coupon';
import { generateUniqueCouponCode } from '@/utils/generateCouponCode';
import mongoose, { CallbackError, Schema } from 'mongoose';

const couponSchema = new Schema<ICoupon>(
    {
        code: {
            type: String,
            trim: true,
            default: '',
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        target: {
            type: String,
            enum: Object.values(CouponTarget),
            default: CouponTarget.PUBLIC,
        },
        couponType: {
            type: String,
            enum: Object.values(CouponType),
            default: CouponType.DISCOUNT,
        },
        discountType: {
            type: String,
            enum: Object.values(CouponDiscountType),
            default: CouponDiscountType.PERCENTAGE,
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
        stock: {
            type: Number,
            min: 0,
            required: true,
        },
        usagePerUser: {
            type: Number,
            min: 1,
            default: 1,
        },
        status: {
            type: String,
            enum: Object.values(CouponStatus),
            default: CouponStatus.ACTIVE,
        },
        isCategoryExcluded: {
            type: Boolean,
            default: false,
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
        startDate: {
            type: Date,
            default: null,
        },
        endDate: {
            type: Date,
            default: null,
        },
        expiredAt: {
            type: Date,
            default: Date.now,
            required: true,
        },
    },
    {
        versionKey: false,
        timestamps: true,
    },
);

couponSchema.index({ code: 1 });

couponSchema.pre('save', async function (next) {
    try {
        if (this.isNew) {
            const code = await generateUniqueCouponCode();
            this.code = code;
        }
    } catch (err) {
        return next(err as CallbackError);
    }
    next();
});

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
