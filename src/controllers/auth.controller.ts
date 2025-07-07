import asyncHandler from '@/helpers/asyncHandler';
import { Request, Response, NextFunction } from 'express';
import { createAccountSchema, loginSchema, resendEmailSchema } from '@/validations/account/accountSchema';
import { BadRequestError } from '@/error/customError';
import { authService } from '@/services/auth.service';
import config from '@/config/env.config';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import customResponse from '@/helpers/response';

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
        throw new BadRequestError(error.details[0].message);
    }

    const { usernameOrEmail, password } = value;
    const userData = await authService.login(usernameOrEmail, password);

    res.cookie('jwt', userData.refreshToken, {
        maxAge: config.cookie.maxAge,
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'lax',
    });

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: userData,
            message: ReasonPhrases.OK,
            status: StatusCodes.OK,
        }),
    );
});

export const register = asyncHandler(async (req: Request, res: Response) => {
    const { error, value } = createAccountSchema.validate(req.body);
    if (error) {
        throw new BadRequestError(error.details[0].message);
    }

    const { email, provider, password, username, phoneNumber } = value;
    const accountSafe = await authService.register({
        email,
        provider,
        password,
        username,
        phoneNumber,
    });

    return res.status(201).json({
        statusCode: 201,
        message: 'Tạo tài khoản thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
        data: accountSafe, //dung de kiem tra viec tao tai khoan, loai bo khi review xong
    });
});

export const refresh = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return authService.refresh(req, res, next);
});

export const logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return authService.refresh(req, res, next);
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
        throw new BadRequestError('Token xác minh không hợp lệ');
    }

    await authService.verifyEmail(token);

    return res.status(200).json({
        statusCode: 200,
        message: 'Xác minh tài khoản thành công',
    });
});

export const resendVerificationEmail = asyncHandler(async (req: Request, res: Response) => {
    const { error, value } = resendEmailSchema.validate(req.body);
    if (error) {
        throw new BadRequestError(error.details[0].message);
    }
    const { email } = value;

    await authService.resendVerificationEmail(email);

    return res.status(200).json({
        statusCode: 200,
        message: 'Email xác minh đã được gửi lại. Vui lòng kiểm tra email của bạn.',
    });
});
