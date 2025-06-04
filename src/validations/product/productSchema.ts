import Joi from 'joi';
import { Types } from 'mongoose';

export const createProductSchema = Joi.object({
    name: Joi.string().min(15).max(100).trim().required().messages({
        'string.empty': 'Tên sản phẩm không được để trống',
        'any.required': 'Tên sản phẩm là bắt buộc',
        'string.base': 'Tên sản phẩm phải là chuỗi',
        'string.min': 'Tên sản phẩm phải lớn hơn hoặc bằng 15 ký tự',
        'string.max': 'Tên sản phẩm phải nhỏ hơn 100 ký tự',
    }),
    categoryId: Joi.string()
        .required()
        .custom((value, helpers) => {
            if (value && !Types.ObjectId.isValid(value)) {
                return helpers.error('string.objectId');
            }
            return value;
        })
        .messages({
            'any.required': 'Category id  là bắt buộc',
            'string.objectId': 'Category id phải là ObjectId hợp lệ',
        }),
    vendorId: Joi.string()
        .optional()
        .custom((value, helpers) => {
            if (value && !Types.ObjectId.isValid(value)) {
                return helpers.error('string.objectId');
            }
            return value;
        })
        .messages({
            'any.required': 'Vendor id là bắt buộc',
            'string.objectId': 'Vendor id phải là ObjectId hợp lệ',
        }),
    description: Joi.string().max(1000).trim().optional().allow('').messages({
        'string.base': 'Mô tả phải là chuỗi',
        'string.max': 'Mô tả phải nhỏ hơn 1000 ký tự',
    }),
});

export const updateProductSchema = Joi.object({
    name: Joi.string().min(15).max(100).trim().optional().messages({
        'string.empty': 'Tên sản phẩm không được để trống',
        'string.base': 'Tên sản phẩm phải là chuỗi',
        'string.min': 'Tên sản phẩm phải lớn hơn hoặc bằng 15 ký tự',
        'string.max': 'Tên sản phẩm phải nhỏ hơn 100 ký tự',
    }),
    categoryId: Joi.string()
        .optional()
        .custom((value, helpers) => {
            if (value && !Types.ObjectId.isValid(value)) {
                return helpers.error('string.objectId');
            }
            return value;
        })
        .messages({
            'string.objectId': 'Category id phải là ObjectId hợp lệ',
        }),
    vendorId: Joi.string()
        .optional()
        .custom((value, helpers) => {
            if (value && !Types.ObjectId.isValid(value)) {
                return helpers.error('string.objectId');
            }
            return value;
        })
        .messages({
            'string.objectId': 'Vendor id phải là ObjectId hợp lệ',
        }),
    description: Joi.string().max(1000).trim().optional().allow('').messages({
        'string.base': 'Mô tả phải là chuỗi',
        'string.max': 'Mô tả phải nhỏ hơn 1000 ký tự',
    }),
    removeImages: Joi.array().items(Joi.string().required()).min(1).optional().messages({
        'array.base': 'removeImages phải là một mảng',
        'array.min': 'removeImages phải có ít nhất 1 phần tử',
        'string.base': 'Mỗi phần tử trong removeImages phải là chuỗi',
        'string.empty': 'Phần tử trong removeImages không được để trống',
    }),
});
