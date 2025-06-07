import { CouponDiscountType, CouponType, MAX_PERCENTAGE, MIN_PERCENTAGE } from '@/constants/coupon';
import { BadRequestFormError } from '@/error/customError';
import { ICoupon } from '@/types/coupon';
type DynamicBody = {
    [key: string]: any;
};

export const isValidBodyCreateCoupon = (body: DynamicBody) => {
    const errors = [];

    if (body.couponType === CouponType.DISCOUNT) {
        if (
            body.discountType === CouponDiscountType.PERCENTAGE &&
            (body.discountValue > MAX_PERCENTAGE || body.discountValue < MIN_PERCENTAGE)
        ) {
            errors.push({
                message: 'Phần trăm giảm giá không được lớn hơn 100 và phải lớn hơn 0',
                field: 'discountType',
            });
        }
    }

    if (body.couponType === CouponType.FREESHIP) {
        if (body.discountType === CouponDiscountType.PERCENTAGE) {
            errors.push({
                message: 'Coupon dạng free ship không được giảm giá theo dạng percentage',
                field: 'discountType',
            });
        }
    }

    if (body.endDate && body.startDate > body.endDate) {
        errors.push({
            message: 'Ngày bắt đầu không được lớn hơn ngày kết thúc',
            field: 'startDate',
        });
    }

    if (body.expiredAt && body.endDate > body.expiredAt) {
        errors.push({
            message: 'Ngày kết thúc không được lớn hơn ngày hết hạn',
            field: 'endDate',
        });
    }

    if (errors.length > 0) {
        throw new BadRequestFormError('Có lỗi xảy ra', errors);
    }
};

export const isValidBodyUpdateCoupon = (coupon: ICoupon, body: DynamicBody) => {
    const errors = [];

    if (body.couponType === CouponType.DISCOUNT) {
        if (
            body.discountType === CouponDiscountType.PERCENTAGE &&
            (body.discountValue > MAX_PERCENTAGE || body.discountValue < MIN_PERCENTAGE)
        ) {
            errors.push({
                message: 'Phần trăm giảm giá không được lớn hơn 100 và phải lớn hơn 0',
                field: 'discountType',
            });
        } else if (body.discountType === CouponDiscountType.FIXED && coupon.maxDiscountValue > 0) {
            coupon.maxDiscountValue = 0;
        }
    }

    if (body.couponType === CouponType.FREESHIP) {
        if (body.discountType === CouponDiscountType.PERCENTAGE) {
            errors.push({
                message: 'Coupon dạng free ship không được giảm giá theo dạng percentage',
                field: 'discountType',
            });
        }
    }

    if (body.endDate && body.startDate > body.endDate) {
        errors.push({
            message: 'Ngày bắt đầu không được lớn hơn ngày kết thúc',
            field: 'startDate',
        });
    }

    if (body.expiredAt && body.endDate > body.expiredAt) {
        errors.push({
            message: 'Ngày kết thúc không được lớn hơn ngày hết hạn',
            field: 'endDate',
        });
    }

    if (errors.length > 0) {
        throw new BadRequestFormError('Có lỗi xảy ra', errors);
    }
};
