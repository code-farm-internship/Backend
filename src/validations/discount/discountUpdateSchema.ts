import Joi from 'joi';
import { Discount as DiscountEnum } from '@/constants/enum';

export const discountUpdateSchema = Joi.object({
    discountType: Joi.string()
        .valid(...Object.values(DiscountEnum))
        .messages({
            'any.only': `discountType phải là một trong các giá trị: ${Object.values(DiscountEnum).join(', ')}`,
        }),
    discountValue: Joi.number().min(0).messages({
        'number.base': 'discountValue phải là số',
        'number.min': 'discountValue phải lớn hơn hoặc bằng 0',
    }),
    startDate: Joi.date().messages({
        'date.base': 'startDate phải là ngày hợp lệ',
    }),
    endDate: Joi.date().messages({
        'date.base': 'endDate phải là ngày hợp lệ',
    }),
})
    .custom((value, helpers) => {
        if (value.startDate > value.endDate) {
            return helpers.message({
                'date.startBeforeEnd': 'startDate phải nhỏ hơn hoặc bằng endDate',
            });
        }
        return value;
    })
    .min(1) // phải có ít nhất 1 trường để update
    .messages({
        'object.min': 'Phải có ít nhất một trường để cập nhật',
    });
