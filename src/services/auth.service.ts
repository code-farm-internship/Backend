import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '@/config/env.config';
import { Token } from '@/constants/token';
import customResponse from '@/helpers/response';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { tokenService } from '.';
import { generateAuthTokens, generateToken, saveToken } from './token.service';
import Account from '@/models/Account';
import User from '@/models/User';
import { BadRequestError } from '@/error/customError';
import { mailSender } from '@/helpers/mail.sender';
import { ROLE } from '@/constants/allowRoles';
import mongoose from 'mongoose';

interface RegisterData {
    email: string;
    provider: string;
    password?: string;
    username: string;
    phoneNumber?: string;
}

export const authService = {
    refresh: async (req: Request, res: Response, next: NextFunction) => {
        const token = req.cookies.jwt;

        const foundedToken = await tokenService.verifyToken(token, config.jwt.jwtRefreshTokenKey, Token.REFRESH);

        const user = {
            _id: foundedToken.userId?._id,
            role: foundedToken.userId.role,
        };

        const { accessToken, refreshToken } = generateAuthTokens(user);

        foundedToken.token = refreshToken;

        await foundedToken.save();

        res.cookie('jwt', refreshToken, {
            maxAge: config.cookie.maxAge,
            httpOnly: true,
            secure: config.env === 'production',
            sameSite: 'lax',
        });

        return res.status(StatusCodes.OK).json(
            customResponse({
                data: { accessToken, refreshToken },
                message: ReasonPhrases.OK,
                status: StatusCodes.OK,
            }),
        );
    },

    logout: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.cookies.jwt;

            if (!token) {
                return res.status(StatusCodes.OK).json(
                    customResponse({
                        data: null,
                        message: 'No active session found',
                        status: StatusCodes.OK,
                    }),
                );
            }

            // Xác minh refresh token để lấy userId
            const foundedToken = await tokenService.verifyToken(token, config.jwt.jwtRefreshTokenKey, Token.REFRESH);
            const userId = foundedToken.userId?._id.toString(); // Chuyển ObjectId thành string

            // Xóa tất cả refresh token của người dùng
            await tokenService.deleteToken(userId, Token.REFRESH);

            // Xóa cookie jwt
            res.clearCookie('jwt', {
                httpOnly: true,
                secure: config.env === 'production',
                sameSite: 'lax',
            });

            return res.status(StatusCodes.OK).json(
                customResponse({
                    data: null,
                    message: 'Logged out successfully',
                    status: StatusCodes.OK,
                }),
            );
        } catch (error) {
            next(error);
        }
    },

    login: async (usernameOrEmail: string, password: string) => {
        // Tìm User bằng username hoặc email
        const user = await User.findOne({
            $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
        });

        if (!user) {
            throw new BadRequestError('Tài khoản hoặc mật khẩu không đúng');
        }

        // Tìm Account với userId và provider: email
        const account = await Account.findOne({
            userId: user._id,
            provider: 'email',
        }).select('+password');

        if (!account || !account.password) {
            throw new BadRequestError('Tài khoản hoặc mật khẩu không đúng');
        }

        const isPasswordValid = await bcrypt.compare(password, account.password);
        if (!isPasswordValid) {
            throw new BadRequestError('Tài khoản hoặc mật khẩu không đúng');
        }

        if (!account.isVerified) {
            throw new BadRequestError('Tài khoản chưa được xác thực qua email');
        }

        const tokens = generateAuthTokens({ userId: user._id, role: user.role });

        saveToken(tokens.refreshToken, user._id.toString(), Token.REFRESH);

        const userData = {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            username: user.username,
            email: user.email,
        };

        return userData;
    },

    register: async (data: RegisterData) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { email, provider, password, username, phoneNumber } = data;

            if (provider !== 'email') {
                throw new BadRequestError('Hiện tại chỉ hỗ trợ đăng ký bằng email');
            }

            // Kiểm tra email và provider trùng
            const existingAccount = await Account.findOne({ email, provider });
            if (existingAccount) {
                throw new BadRequestError('Tài khoản này đã tồn tại');
            }

            // Tìm userId từ Account hiện có hoặc tạo User mới
            let user;
            const accountWithEmail = await Account.findOne({ email });
            if (accountWithEmail) {
                // Email đã tồn tại trong Account, sử dụng userId hiện có
                user = await User.findById(accountWithEmail.userId);
                if (!user) {
                    throw new BadRequestError('Không tìm thấy User liên kết với email này');
                }
                // Cập nhật thông tin User
                user.username = username;
                user.phoneNumber = phoneNumber || user.phoneNumber;
                user.role = ROLE.USER;
                await user.save();
            } else {
                // Email chưa tồn tại, tạo User mới
                user = await User.create({
                    username,
                    email,
                    phoneNumber,
                    role: ROLE.USER,
                });
            }

            // Tạo tài khoản Account
            const accountData = {
                userId: user._id,
                provider,
                email,
                phoneNumber,
                password: password ? await bcrypt.hash(password, 10) : undefined,
                isVerified: false,
                role: user.role,
            };

            // Gửi email xác minh
            await authService.sendVerificationEmail(accountData);

            const account = await Account.create([accountData], { session });
            const createdAccount = account[0];

            await session.commitTransaction();
            session.endSession();

            const { password: _, ...accountSafe } = createdAccount.toObject();
            return { ...accountSafe, username: user.username };
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    },

    verifyEmail: async (token: string) => {
        try {
            const decoded = jwt.verify(
                token,
                (config.jwt as any).jwtVerificationTokenKey || config.jwt.jwtAccessTokenKey,
            ) as { userId: string };
            const account = await Account.findOne({ userId: decoded.userId });
            if (!account) {
                throw new BadRequestError('Tài khoản không tồn tại');
            }
            if (account.isVerified) {
                throw new BadRequestError('Tài khoản đã được xác minh');
            }
            account.isVerified = true;
            await account.save();
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                throw new BadRequestError('Token xác minh đã hết hạn. Vui lòng yêu cầu gửi lại email xác minh.');
            }
            throw new BadRequestError('Token không hợp lệ');
        }
    },

    resendVerificationEmail: async (email: string) => {
        const account = await Account.findOne({ email, provider: 'email' });
        if (!account) {
            throw new BadRequestError('Tài khoản không tồn tại');
        }
        if (account.isVerified) {
            throw new BadRequestError('Tài khoản đã được xác minh');
        }

        await authService.sendVerificationEmail(account);
    },

    sendVerificationEmail: async (account: any) => {
        const userPayload = {
            _id: account.userId,
            role: account.role,
        };
        const verificationToken = generateToken(
            userPayload,
            (config.jwt as any).jwtVerificationTokenKey || config.jwt.jwtAccessTokenKey,
            '30m',
        );
        const verifyUrl = `${config.clientUrl}/auth/verify-email?token=${verificationToken}&tk=${account.email}`;

        try {
            await mailSender({
                email: account.email,
                subject: 'Xác thực tài khoản của bạn',
                html: `
          <p>Chào mừng bạn đến với dịch vụ của chúng tôi!</p>
          <p>Vui lòng bấm vào nút dưới đây để xác thực tài khoản:</p>
          <a href="${verifyUrl}" style="padding: 10px 20px; background: green; color: white; text-decoration: none;">Xác thực tài khoản</a>
          <p><strong>Lưu ý:</strong> Liên kết này chỉ có hiệu lực trong 30 phút. Nếu liên kết hết hạn, bạn có thể yêu cầu gửi lại email xác minh.</p>`,
            });
        } catch (error) {
            throw new BadRequestError('Không thể gửi email xác minh. Vui lòng thử lại sau.');
        }
    },
};

export default authService;
