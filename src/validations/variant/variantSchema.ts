import Joi from 'joi';
import { Types } from 'mongoose';

export const variantSchema = Joi.object({
    price: Joi.number().integer().required().messages({
        'number.base': 'Giá biến thể phải là số',
        'number.integer': 'Giá biến thể phải là số nguyên',
        'any.required': 'Giá biến thể là bắt buộc',
    }),
    stock: Joi.number().integer().min(0).required().messages({
        'number.base': 'Số lượng tồn kho phải là số',
        'number.integer': 'Số lượng tồn kho phải là số nguyên',
        'number.min': 'Số lượng tồn kho không được nhỏ hơn 0',
        'any.required': 'Số lượng tồn kho là bắt buộc',
    }),
    discountId: Joi.string()
        .optional()
        .allow(null, '')
        .custom((value, helpers) => {
            if (value && !Types.ObjectId.isValid(value)) {
                return helpers.error('string.objectId');
            }
            return value;
        })
        .messages({
            'string.objectId': 'Discount ID phải là ObjectId hợp lệ',
        }),
    formatId: Joi.string()
        .required()
        .custom((value, helpers) => {
            if (!Types.ObjectId.isValid(value)) {
                return helpers.error('string.objectId');
            }
            return value;
        })
        .messages({
            'string.objectId': 'Format ID phải là ObjectId hợp lệ',
            'any.required': 'Format ID là bắt buộc',
        }),
});

export const createVariantSchema = Joi.object({
    productId: Joi.string()
        .required()
        .custom((value, helpers) => {
            if (!Types.ObjectId.isValid(value)) {
                return helpers.error('string.objectId');
            }
            return value;
        })
        .messages({
            'string.base': 'Product ID phải là chuỗi',
            'string.objectId': 'Product ID phải là ObjectId hợp lệ',
            'any.required': 'Product ID là bắt buộc',
        }),
    variants: Joi.array().items(variantSchema).min(1).required().messages({
        'array.base': 'Variants phải là một mảng',
        'array.min': 'Phải có ít nhất một biến thể',
        'any.required': 'Variants là bắt buộc',
    }),
});

const variantUpdateSchema = Joi.object({
    price: Joi.number().integer().optional().messages({
        'number.base': 'Giá biến thể phải là số',
        'number.integer': 'Giá biến thể phải là số nguyên',
    }),
    stock: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Số lượng tồn kho phải là số',
        'number.integer': 'Số lượng tồn kho phải là số nguyên',
        'number.min': 'Số lượng tồn kho không được nhỏ hơn 0',
    }),
    discountId: Joi.string()
        .optional()
        .allow(null, '')
        .custom((value, helpers) => {
            if (value && !Types.ObjectId.isValid(value)) {
                return helpers.error('string.objectId');
            }
            return value;
        })
        .messages({
            'string.objectId': 'Discount ID phải là ObjectId hợp lệ',
        }),
    formatId: Joi.string()
        .optional()
        .custom((value, helpers) => {
            if (value && !Types.ObjectId.isValid(value)) {
                return helpers.error('string.objectId');
            }
            return value;
        })
        .messages({
            'string.objectId': 'Format ID phải là ObjectId hợp lệ',
        }),
});

export const updateVariantSchema = Joi.object({
    productId: Joi.string()
        .optional()
        .custom((value, helpers) => {
            if (value && !Types.ObjectId.isValid(value)) {
                return helpers.error('string.objectId');
            }
            return value;
        })
        .messages({
            'string.objectId': 'Product ID phải là ObjectId hợp lệ',
        }),
    variants: Joi.array().items(variantUpdateSchema).min(1).optional().messages({
        'array.base': 'Variants phải là một mảng',
        'array.min': 'Phải có ít nhất một biến thể',
    }),
    removeImages: Joi.array().items(Joi.string().required()).min(1).optional().messages({
        'array.base': 'removeImages phải là một mảng',
        'array.min': 'removeImages phải có ít nhất 1 phần tử',
        'string.base': 'Mỗi phần tử trong removeImages phải là chuỗi',
        'string.empty': 'Phần tử trong removeImages không được để trống',
    }),
});
