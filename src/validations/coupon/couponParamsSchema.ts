import Joi from 'joi';

export const couponParamsSchema = Joi.object({
    code: Joi.string().required().messages({
        'any.required': 'Mã coupon không được để trống',
    }),
});
