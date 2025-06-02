import Joi from 'joi';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const BookmarkSchema = Joi.object({
    userId: Joi.string().trim().pattern(objectIdPattern).required().messages({
        'string.pattern.base': 'userId không hợp lệ',
        'any.required': 'userId là bắt buộc',
        'string.empty': 'userId không được để trống',
    }),

    productId: Joi.string().trim().pattern(objectIdPattern).required().messages({
        'string.pattern.base': 'productId không hợp lệ',
        'any.required': 'productId là bắt buộc',
        'string.empty': 'productId không được để trống',
    }),

    note: Joi.string().trim().optional().allow('').messages({
        'string.base': 'note phải là chuỗi ký tự',
    }),
});
