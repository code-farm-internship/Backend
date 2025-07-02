import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import querystring from 'qs';
import axios from 'axios';
import { format } from 'date-fns';
import config from '@/config/env.config';
import Order from '@/models/Order'; // Sửa thành default import
import { TransactionStatus } from '@/constants/enum';

// Interface cho tham số VNPay
interface VNPayParams {
    [key: string]: string;
}

// Interface cho phản hồi refund của VNPay
interface VNPayRefundResponse {
    vnp_ResponseCode: string;
    vnp_Message: string;
    vnp_TxnRef?: string;
    vnp_Amount?: string;
    vnp_TransactionNo?: string;
    [key: string]: string | undefined;
}

// Interface cho request body khi tạo URL thanh toán
interface PaymentRequest {
    orderId: string; // Ánh xạ tới _id của Order
    amount: number;
    orderInfo: string;
    ipAddr: string;
}

// Interface cho request body khi yêu cầu hoàn tiền
interface RefundRequest {
    orderId: string; // Ánh xạ tới _id của Order
    amount: number;
    transactionId: string; // vnp_TransactionNo
    reason: string;
    ipAddr: string;
}

// Hàm sắp xếp object theo key và ép kiểu thành chuỗi
function sortObject(obj: VNPayParams): VNPayParams {
    const sorted: VNPayParams = {};
    const keys = Object.keys(obj).sort();
    keys.forEach((key) => {
        sorted[key] = String(obj[key]);
    });
    return sorted;
}

// Hàm tạo chữ ký SHA512
function createSecureHash(params: VNPayParams, secret: string): string {
    const sortedParams = sortObject(params);
    const signData = querystring.stringify(sortedParams, { encode: false }).replace(/ /g, '+');
    const hmac = crypto.createHmac('sha512', secret);
    return hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
}

// Tạo URL thanh toán VNPay
export const createPaymentUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { orderId, amount, orderInfo, ipAddr }: PaymentRequest = req.body;

        // Kiểm tra đầu vào
        if (!orderId || !amount || !orderInfo || !ipAddr) {
            return res.status(400).json({
                status: 'error',
                message: 'Thiếu các trường bắt buộc: orderId, amount, orderInfo, ipAddr',
            });
        }

        // Kiểm tra đơn hàng tồn tại
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                status: 'error',
                message: 'Không tìm thấy đơn hàng',
            });
        }

        // Tạo tham số VNPay
        const vnpParams: VNPayParams = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: config.vnpay.vnp_TmnCode,
            vnp_Locale: 'vn',
            vnp_CurrCode: 'VND',
            vnp_TxnRef: orderId,
            vnp_OrderInfo: orderInfo,
            vnp_OrderType: 'billpayment',
            vnp_Amount: String(amount * 100),
            vnp_ReturnUrl: config.vnpay.vnp_ReturnUrl,
            vnp_IpAddr: ipAddr,
            vnp_CreateDate: format(new Date(), 'yyyyMMddHHmmss'),
        };

        // Tạo chữ ký
        vnpParams.vnp_SecureHash = createSecureHash(vnpParams, config.vnpay.vnp_HashSecret);

        // Tạo URL thanh toán
        const vnpUrl = `${config.vnpay.vnp_Url}?${querystring.stringify(vnpParams, { encode: false })}`;

        // Cập nhật trạng thái đơn hàng
        await Order.findByIdAndUpdate(orderId, {
            $set: { paymentStatus: TransactionStatus.PENDING, updatedAt: new Date() },
        });

        res.status(200).json({
            status: 'success',
            paymentUrl: vnpUrl,
        });
    } catch (error) {
        next(error);
    }
};

// Xử lý callback từ VNPay
export const vnpayReturn = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vnpParams = req.query as VNPayParams;
        // Ép kiểu tất cả giá trị thành chuỗi
        for (const key in vnpParams) {
            vnpParams[key] = String(vnpParams[key]);
        }

        const secureHash = vnpParams.vnp_SecureHash;
        if (!secureHash) {
            return res.status(400).json({
                status: 'error',
                message: 'Thiếu vnp_SecureHash',
            });
        }

        // Xóa các tham số không cần thiết
        delete vnpParams.vnp_SecureHash;
        delete vnpParams.vnp_SecureHashType;

        // Tạo chữ ký để xác minh
        const signed = createSecureHash(vnpParams, config.vnpay.vnp_HashSecret);

        const orderId = vnpParams.vnp_TxnRef;
        const rspCode = vnpParams.vnp_ResponseCode;
        const transactionId = vnpParams.vnp_TransactionNo;

        if (!orderId || !rspCode) {
            return res.status(400).json({
                status: 'error',
                message: 'Thiếu tham số bắt buộc: vnp_TxnRef hoặc vnp_ResponseCode',
            });
        }

        // Kiểm tra đơn hàng
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                status: 'error',
                message: 'Không tìm thấy đơn hàng',
            });
        }

        if (secureHash.toLowerCase() === signed.toLowerCase()) {
            if (rspCode === '00') {
                // Cập nhật trạng thái đơn hàng
                await Order.findByIdAndUpdate(orderId, {
                    $set: {
                        paymentStatus: TransactionStatus.COMPLETED,
                        transactionId: transactionId || order.transactionId,
                        isPaid: true,
                        updatedAt: new Date(),
                    },
                });
                res.status(200).json({
                    status: 'success',
                    message: 'Giao dịch thành công',
                    orderId,
                });
            } else {
                await Order.findByIdAndUpdate(orderId, {
                    $set: { paymentStatus: TransactionStatus.FAILED, updatedAt: new Date() },
                });
                res.status(400).json({
                    status: 'error',
                    message: 'Giao dịch thất bại',
                    orderId,
                });
            }
        } else {
            res.status(400).json({
                status: 'error',
                message: 'Chữ ký không hợp lệ',
            });
        }
    } catch (error) {
        next(error);
    }
};

// Xử lý IPN từ VNPay
export const vnpayIpn = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vnpParams = req.query as VNPayParams;
        // Ép kiểu tất cả giá trị thành chuỗi
        for (const key in vnpParams) {
            vnpParams[key] = String(vnpParams[key]);
        }

        const secureHash = vnpParams.vnp_SecureHash;
        if (!secureHash) {
            return res.status(200).json({
                RspCode: '97',
                Message: 'Thiếu vnp_SecureHash',
            });
        }

        // Xóa các tham số không cần thiết
        delete vnpParams.vnp_SecureHash;
        delete vnpParams.vnp_SecureHashType;

        // Tạo chữ ký để xác minh
        const signed = createSecureHash(vnpParams, config.vnpay.vnp_HashSecret);

        const orderId = vnpParams.vnp_TxnRef;
        const rspCode = vnpParams.vnp_ResponseCode;
        const command = vnpParams.vnp_Command;
        const transactionId = vnpParams.vnp_TransactionNo;

        if (!orderId || !rspCode || !command) {
            return res.status(200).json({
                RspCode: '97',
                Message: 'Thiếu tham số bắt buộc',
            });
        }

        // Kiểm tra đơn hàng
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(200).json({
                RspCode: '01',
                Message: 'Không tìm thấy đơn hàng',
            });
        }

        if (secureHash === signed) {
            if (rspCode === '00') {
                if (command === 'refund') {
                    await Order.findByIdAndUpdate(orderId, {
                        $set: {
                            paymentStatus: TransactionStatus.REFUNDED,
                            updatedAt: new Date(),
                        },
                    });
                    res.status(200).json({
                        RspCode: '00',
                        Message: 'Hoàn tiền thành công',
                    });
                } else {
                    await Order.findByIdAndUpdate(orderId, {
                        $set: {
                            paymentStatus: TransactionStatus.COMPLETED,
                            transactionId: transactionId || order.transactionId,
                            isPaid: true,
                            updatedAt: new Date(),
                        },
                    });
                    res.status(200).json({
                        RspCode: '00',
                        Message: 'Thanh toán thành công',
                    });
                }
            } else {
                await Order.findByIdAndUpdate(orderId, {
                    $set: {
                        paymentStatus:
                            command === 'refund' ? TransactionStatus.REFUND_FAILED : TransactionStatus.FAILED,
                        updatedAt: new Date(),
                    },
                });
                res.status(200).json({
                    RspCode: '97',
                    Message: command === 'refund' ? 'Hoàn tiền thất bại' : 'Giao dịch thất bại',
                });
            }
        } else {
            res.status(200).json({
                RspCode: '97',
                Message: 'Chữ ký không hợp lệ',
            });
        }
    } catch (error) {
        next(error);
    }
};

// Xử lý yêu cầu hoàn tiền
export const refund = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { orderId, amount, transactionId, reason, ipAddr }: RefundRequest = req.body;

        // Kiểm tra đầu vào
        if (!orderId || !amount || !transactionId || !reason || !ipAddr) {
            return res.status(400).json({ status: 'error', message: 'Thiếu các trường bắt buộc' });
        }

        // Kiểm tra đơn hàng
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ status: 'error', message: 'Không tìm thấy đơn hàng' });
        }

        // Kiểm tra trạng thái và phương thức thanh toán
        if (order.paymentStatus !== TransactionStatus.COMPLETED) {
            return res.status(400).json({ status: 'error', message: 'Đơn hàng chưa được thanh toán' });
        }
        if (order.paymentMethod !== 'VNPay') {
            return res.status(400).json({ status: 'error', message: 'Chỉ hỗ trợ hoàn tiền VNPay' });
        }

        // Kiểm tra số tiền
        if (amount > order.totalAmount) {
            return res.status(400).json({ status: 'error', message: 'Số tiền hoàn vượt quá số tiền gốc' });
        }

        // Kiểm tra transactionId
        if (order.transactionId !== transactionId) {
            console.error('Lỗi: transactionId không khớp', {
                requestTransactionId: transactionId,
                orderTransactionId: order.transactionId,
            });
            return res.status(400).json({ status: 'error', message: 'Mã giao dịch không khớp' });
        }

        // Tạo tham số VNPay
        const vnpParams: VNPayParams = {
            vnp_Version: '2.1.0',
            vnp_Command: 'refund',
            vnp_TmnCode: String(config.vnpay.vnp_TmnCode || ''),
            vnp_TransactionType: '02',
            vnp_TxnRef: String(orderId),
            vnp_Amount: String(amount * 100),
            vnp_OrderInfo: String(reason),
            vnp_TransactionNo: String(transactionId), // Đảm bảo là chuỗi
            vnp_TransactionDate: format(new Date(order.createdAt), 'yyyyMMddHHmmss'),
            vnp_CreateBy: 'user_refund',
            vnp_CreateDate: format(new Date(), 'yyyyMMddHHmmss'),
            vnp_IpAddr: String(ipAddr),
        };

        // Tạo chữ ký
        vnpParams.vnp_SecureHash = createSecureHash(vnpParams, config.vnpay.vnp_HashSecret);

        // Log tham số
        console.log('Tham số gửi đi:', vnpParams);
        console.log('Dữ liệu gửi đi:', querystring.stringify(vnpParams, { encode: false }));

        console.log('vnp_TransactionNo:', vnpParams.vnp_TransactionNo);
        console.log('vnp_PayDate:', vnpParams.vnp_PayDate);
        // Gửi yêu cầu hoàn tiền
        const response = await axios.post<VNPayRefundResponse>(
            'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction',
            querystring.stringify(vnpParams, { encode: false }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
        );

        const result: VNPayRefundResponse = response.data;
        console.log('Phản hồi từ VNPay:', result);

        if (result.vnp_ResponseCode === '00') {
            await Order.findByIdAndUpdate(orderId, {
                $set: { paymentStatus: TransactionStatus.REFUNDED, updatedAt: new Date() },
            });
            return res.status(200).json({ status: 'success', message: 'Hoàn tiền thành công', data: result });
        } else {
            await Order.findByIdAndUpdate(orderId, {
                $set: { paymentStatus: TransactionStatus.REFUND_FAILED, updatedAt: new Date() },
            });
            return res
                .status(400)
                .json({ status: 'error', message: result.vnp_Message || 'Hoàn tiền thất bại', data: result });
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
        const errorData = (error as any).response?.data || null;
        console.error('Lỗi khi xử lý hoàn tiền:', errorData, errorMessage);
        return res.status(500).json({
            status: 'error',
            message: 'Lỗi server khi xử lý hoàn tiền',
            error: errorMessage,
            data: errorData,
        });
    }
};
