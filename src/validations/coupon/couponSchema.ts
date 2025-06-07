import { CouponDiscountType, CouponStatus, CouponTarget, CouponType } from '@/constants/coupon';
import Joi from 'joi';

const now = new Date();

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const createCouponSchema = Joi.object({
    name: Joi.string().trim().min(6).max(100).required().messages({
        'string.empty': 'Tên coupon không được để trống.',
        'string.min': 'Tên coupon phải có ít nhất {#limit} ký tự.',
        'string.max': 'Tên coupon không được vượt quá {#limit} ký tự.',
        'any.required': 'Tên coupon là bắt buộc.',
    }),
    description: Joi.string().trim().max(500).allow('').optional().messages({
        'string.base': 'Mô tả phải là chuỗi.',
        'string.max': 'Mô tả không được vượt quá {#limit} ký tự.',
    }),
    couponType: Joi.string()
        .valid(...Object.values(CouponType))
        .required()
        .messages({
            'any.required': 'Loại coupon là bắt buộc.',
            'any.only': 'Loại coupon phải là discount hoặc free_ship.',
        }),
    target: Joi.string()
        .valid(...Object.values(CouponTarget))
        .messages({
            'string.base': 'Đối tượng áp dụng phải là chuỗi.',
            'any.only': 'Đối tượng áp dụng phải là public, collectable hoặc new_user.',
        }),
    discountType: Joi.string()
        .valid(...Object.values(CouponDiscountType))
        .required()
        .messages({
            'any.required': 'Loại giảm giá là bắt buộc.',
            'any.only': 'Loại giảm giá phải là percentage hoặc fixed.',
        }),
    discountValue: Joi.number().min(1).required().messages({
        'number.min': 'Giá trị đơn hàng tối thiểu phải lớn hơn 1.',
        'any.required': 'Giá trị đơn hàng tối thiểu là bắt buộc.',
    }),
    minOrderValue: Joi.number().min(0).required().messages({
        'number.min': 'Giá trị đơn hàng tối thiểu không được âm.',
        'any.required': 'Giá trị đơn hàng tối thiểu là bắt buộc.',
    }),
    maxDiscountValue: Joi.number().min(0).allow(null).optional().messages({
        'number.min': 'Giá trị giảm giá tối đa phải là số dương.',
    }),
    status: Joi.string()
        .valid(...Object.values(CouponStatus))
        .required()
        .messages({
            'any.required': 'Trạng thái của copuon là bắt buộc.',
            'any.only': 'Trạng thái của coupon bắt buộc là active hoặc inactive.',
        }),
    stock: Joi.number().integer().min(0).max(2000).required().messages({
        'number.integer': 'Số lượng coupon phải là số nguyên.',
        'number.min': 'Số lượng coupon không được âm.',
        'string.max': 'Số lượng không được vượt quá {#limit} ký tự.',
        'any.required': 'Số lượng coupon là bắt buộc.',
    }),
    usagePerUser: Joi.number().integer().min(1).required().messages({
        'number.integer': 'Số lần sử dụng mỗi người dùng phải là số nguyên.',
        'number.min': 'Số lần sử dụng mỗi người dùng không được âm.',
        'any.required': 'Số lần sử dụng mỗi người dùng là bắt buộc.',
    }),
    startDate: Joi.date().min(now).optional().messages({
        'date.min': 'Ngày bắt đầu không được ở trong quá khứ.',
        'date.base': 'Ngày bắt đầu không hợp lệ (định dạng ngày tháng).',
    }),
    endDate: Joi.date().optional().messages({
        'date.base': 'Ngày bắt đầu không hợp lệ (định dạng ngày tháng).',
        'date.min': 'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.',
    }),
    expiredAt: Joi.date().required().messages({
        'date.min': 'Ngày hết hạn cuối cùng phải lớn hơn hoặc bằng ngày kết thúc.',
        'date.base': 'Ngày hết hạn không hợp lệ (định dạng ngày tháng).',
        'any.required': 'Ngày hết hạn là bắt buộc.',
    }),
    categories: Joi.array()
        .items(
            Joi.string().pattern(objectIdPattern).messages({
                'string.pattern.base': 'Mỗi ID danh mục phải có định dạng ObjectId hợp lệ.',
            }),
        )
        .min(1)
        .optional()
        .messages({
            'array.min': 'Danh mục phải có ít nhất {#limit} phần tử.',
        }),
});

export const updateCouponSchema = Joi.object({
    name: Joi.string().trim().min(3).max(100).optional().messages({
        'string.empty': 'Tên coupon không được để trống.',
        'string.min': 'Tên coupon phải có ít nhất {#limit} ký tự.',
        'string.max': 'Tên coupon không được vượt quá {#limit} ký tự.',
    }),
    description: Joi.string().trim().max(500).allow('').optional().messages({
        'string.base': 'Mô tả phải là chuỗi.',
        'string.max': 'Mô tả không được vượt quá {#limit} ký tự.',
    }),
    couponType: Joi.string()
        .valid(...Object.values(CouponType))
        .optional()
        .messages({
            'any.only': 'Loại coupon phải là "discount" hoặc "free_ship".',
        }),
    target: Joi.string()
        .valid(...Object.values(CouponTarget))
        .messages({
            'string.base': 'Đối tượng áp dụng phải là chuỗi.',
            'any.only': 'Đối tượng áp dụng phải là public, collectable hoặc new_user.',
        }),
    discountType: Joi.string()
        .valid(...Object.values(CouponDiscountType))
        .optional()
        .messages({
            'any.only': 'Loại giảm giá phải là percentage hoặc fixed.',
        }),
    status: Joi.string()
        .valid(...Object.values(CouponStatus))
        .optional()
        .messages({
            'any.only': 'Trạng thái của coupon bắt buộc là active hoặc inactive.',
        }),
    discountValue: Joi.number().min(1).messages({
        'number.min': 'Giá trị đơn hàng tối thiểu không được âm.',
    }),
    minOrderValue: Joi.number().min(0).optional().messages({
        'number.min': 'Giá trị đơn hàng tối thiểu không được âm.',
    }),
    maxDiscountValue: Joi.number().positive().allow(null).optional().messages({
        'number.positive': 'Giá trị giảm giá tối đa phải là số dương.',
    }),
    stock: Joi.number().integer().min(0).max(2000).optional().messages({
        'number.integer': 'Số lượng coupon phải là số nguyên.',
        'number.min': 'Số lượng coupon không được âm.',
        'string.max': 'Số lượng không được vượt quá {#limit} ký tự.',
    }),
    usagePerUser: Joi.number().integer().min(1).optional().messages({
        'number.integer': 'Số lần sử dụng mỗi người dùng phải là số nguyên.',
        'number.min': 'Số lần sử dụng mỗi người dùng không được âm.',
    }),
    startDate: Joi.date().min(now).optional().messages({
        'date.min': 'Ngày bắt đầu không được ở trong quá khứ.',
        'date.base': 'Ngày bắt đầu không hợp lệ (định dạng ngày tháng).',
    }),
    endDate: Joi.date().optional().messages({
        'date.base': 'Ngày bắt đầu không hợp lệ (định dạng ngày tháng).',
        'date.min': 'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.',
    }),
    expiredAt: Joi.date().optional().messages({
        'date.min': 'Ngày hết hạn cuối cùng phải lớn hơn hoặc bằng ngày kết thúc.',
        'date.base': 'Ngày hết hạn không hợp lệ (định dạng ngày tháng).',
    }),
    categories: Joi.array()
        .items(
            Joi.string().pattern(objectIdPattern).messages({
                'string.pattern.base': 'Mỗi ID danh mục phải có định dạng ObjectId hợp lệ.',
            }),
        )
        .min(1)
        .optional()
        .messages({
            'array.min': 'Danh mục phải có ít nhất {#limit} phần tử.',
        }),
});
