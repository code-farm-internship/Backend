import { Request, Response, NextFunction } from 'express';
import Order from '@/models/Order';
import Coupon from '@/models/Coupon';
import Product from '@/models/Product';
import ProductVariant from '@/models/ProductVariant';
import {
    changeOrderStatusSchema,
    createOrderCODSchema,
    createOrderOnlineSchema,
    updateOrderSchema,
} from '@/validations/order/orderSchema';
import { BadRequestError, NotFoundError } from '@/error/customError';
// import { processOnlinePayment } from '@/helpers/payment';
import { OrderStatus, TransactionStatus } from '@/constants/enum';
import { ROLE } from '@/constants/allowRoles';
import { calculateDiscount, validateCoupon } from './coupon.service';

export const createOrderCOD = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate input
        const { error, value } = createOrderCODSchema.validate(req.body);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }

        const { items, customerInfo, receiverInfo, shippingAddress, couponCode, userNote, shippingFee } = value;
        const userId = req.userId;

        // Kiểm tra items
        let totalAmount = 0;
        for (const item of items) {
            const product = await Product.findById(item.productId);
            const variant = await ProductVariant.findById(item.productVariantId);
            if (!product || !variant) {
                throw new NotFoundError(`Product ${item.productId} or variant ${item.productVariantId} not found`);
            }
            if (item.price !== variant.price) {
                throw new BadRequestError(`Price mismatch for variant ${item.productVariantId}`);
            }
            totalAmount += item.price * item.quantity;
        }

        const couponId = null;
        let discountAmount = 0;
        let finalAmount = totalAmount + (shippingFee || 0);

        if (couponCode) {
            // Xác thực coupon
            const coupon = 1; //await validateCoupon(couponCode, totalAmount);

            // Tính giảm giá
            const { discount, final } = calculateDiscount(coupon, totalAmount, shippingFee || 0);
            discountAmount = discount;
            finalAmount = final;
            //couponId = coupon._id; // Tam thoi vi ham coupon rong
        }

        // Tạo đơn hàng COD
        const order = new Order({
            userId,
            items,
            customerInfo,
            receiverInfo,
            shippingAddress,
            totalAmount: finalAmount,
            discountAmount,
            couponId,
            paymentMethod: 'COD',
            status: OrderStatus.PENDING,
            paymentStatus: TransactionStatus.PENDING,
            shippingFee,
            userNote,
        });

        await order.save();
        return res.status(201).json({ message: 'COD order created', order });
    } catch (error) {
        next(error);
    }
};

export const createOrderOnline = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, value } = createOrderOnlineSchema.validate(req.body);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }

        const {
            items,
            customerInfo,
            receiverInfo,
            shippingAddress,
            couponCode,
            paymentDetails,
            userNote,
            shippingFee,
        } = value;

        const userId = req.userId;

        // Tính tổng tiền
        let totalAmount = 0;
        for (const item of items) {
            const product = await Product.findById(item.productId);
            const variant = await ProductVariant.findById(item.productVariantId);
            if (!product || !variant) {
                throw new NotFoundError(`Product ${item.productId} or variant ${item.productVariantId} not found`);
            }
            if (item.price !== variant.price) {
                throw new BadRequestError(`Price mismatch for variant ${item.productVariantId}`);
            }
            totalAmount += item.price * item.quantity;
        }

        const couponId = null;
        let discountAmount = 0;
        let finalAmount = totalAmount + (shippingFee || 0);

        // Kiểm tra coupon (nếu có)
        if (couponCode) {
            const coupon = true; //await validateCoupon(couponCode, totalAmount);
            const { discount, final } = calculateDiscount(coupon, totalAmount, shippingFee || 0);
            discountAmount = discount;
            finalAmount = final;
            //couponId = coupon._id; //ham rong
        }

        const order = new Order({
            userId,
            items,
            customerInfo,
            receiverInfo,
            shippingAddress,
            totalAmount: finalAmount,
            discountAmount,
            couponId,
            paymentMethod: 'ONLINE',
            paymentStatus: TransactionStatus.SUCCESSFULLY,
            status: OrderStatus.CONFIRMED,
            isPaid: true,
            shippingFee,
            userNote,
        });

        await order.save();

        return res.status(201).json({ message: 'Online order created', order });
    } catch (error) {
        next(error);
    }
};

export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
    const { page = '1', limit = '10', sortBy = 'createdAt', order = 'desc' } = req.query;
    const userId = req.userId;

    const orders = await Order.find({ userId, isDeleted: false })
        .sort({ [sortBy as string]: order === 'asc' ? 1 : -1 })
        .skip((parseInt(page as string) - 1) * parseInt(limit as string))
        .limit(parseInt(limit as string))
        .populate('items.productId')
        .populate('items.productVariantId')
        .populate('couponId');

    const total = await Order.countDocuments({ userId, isDeleted: false });

    return res.status(200).json({
        message: 'Orders retrieved successfully',
        orders,
        pagination: { page: parseInt(page as string), limit: parseInt(limit as string), total },
    });
};

export const getOrderDetail = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.userId;

    const order = await Order.findOne({ _id: id, userId, isDeleted: false })
        .populate('items.productId')
        .populate('items.productVariantId')
        .populate('couponId');

    if (!order) {
        throw new NotFoundError('Order not found');
    }

    return res.status(200).json({ message: 'Order retrieved successfully', order });
};

export const updateOrder = async (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = updateOrderSchema.validate(req.body);
    if (error) {
        throw new BadRequestError(error.details[0].message);
    }

    const { id } = req.params;
    const { items, customerInfo, receiverInfo, shippingAddress, userNote, shippingFee } = value;
    const userId = req.userId;

    const order = await Order.findOne({ _id: id, userId, isDeleted: false });
    if (!order) {
        throw new NotFoundError('Order not found');
    }

    // Chỉ cho phép cập nhật nếu trạng thái là PENDING
    if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestError('Cannot update order after it has been confirmed');
    }

    // Cập nhật items nếu có
    let totalAmount = 0;
    if (items) {
        for (const item of items) {
            const product = await Product.findById(item.productId);
            const variant = await ProductVariant.findById(item.productVariantId);
            if (!product || !variant) {
                throw new NotFoundError(`Product ${item.productId} or variant ${item.productVariantId} not found`);
            }
            if (item.price !== variant.price) {
                throw new BadRequestError(`Price mismatch for variant ${item.productVariantId}`);
            }
            totalAmount += item.price * item.quantity;
        }
        order.items = items;
    } else {
        // Nếu không có items mới, giữ nguyên totalAmount cũ
        totalAmount = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
    // Tính giảm giá nếu có coupon
    if (order.couponId) {
        const coupon = await Coupon.findById(order.couponId);
        if (coupon) {
            const { discount, final } = calculateDiscount(
                coupon,
                totalAmount,
                shippingFee !== undefined ? shippingFee : order.shippingFee,
            );
            order.totalAmount = final;
        } else {
            // Coupon không hợp lệ => không giảm
            order.totalAmount = totalAmount + (shippingFee !== undefined ? shippingFee : order.shippingFee);
        }
    } else {
        // Không có coupon
        order.totalAmount = totalAmount + (shippingFee !== undefined ? shippingFee : order.shippingFee);
    }

    // Cập nhật các trường khác nếu có
    if (customerInfo) order.customerInfo = customerInfo;
    if (receiverInfo) order.receiverInfo = receiverInfo;
    if (shippingAddress) order.shippingAddress = shippingAddress;
    if (userNote) order.userNote = userNote;
    if (shippingFee !== undefined) order.shippingFee = shippingFee;

    await order.save();
    return res.status(200).json({ message: 'Order updated successfully', order });
};

export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.userId;

    const order = await Order.findOne({ _id: id, userId, isDeleted: false });
    if (!order) {
        throw new NotFoundError('Order not found');
    }

    // Chỉ cho phép hủy nếu trạng thái là PENDING hoặc CONFIRMED
    if (![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status)) {
        throw new BadRequestError('Cannot cancel order in current status');
    }

    order.status = OrderStatus.CANCELLED;
    order.cancelBy = (req.role as ROLE) || ROLE.USER;
    await order.save();
    return res.status(200).json({ message: 'Order canceled successfully', order });
};

export const softDeleteOrder = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.userId;

    const order = await Order.findOne({ _id: id, userId, isDeleted: false });
    if (!order) {
        throw new NotFoundError('Order not found');
    }

    order.isDeleted = true;
    await order.save();
    return res.status(200).json({ message: 'Order soft deleted successfully' });
};

export const restoreOrder = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.userId;

    const order = await Order.findOne({ _id: id, userId, isDeleted: true });
    if (!order) {
        throw new NotFoundError('Deleted order not found');
    }

    order.isDeleted = false;
    await order.save();
    return res.status(200).json({ message: 'Order restored successfully', order });
};

export const changeOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    // Validate input
    const { error, value } = changeOrderStatusSchema.validate(req.body);
    if (error) {
        throw new BadRequestError(error.details[0].message);
    }

    const { id } = req.params;
    const { status, adminNote } = value;
    const userId = req.userId;

    const order = await Order.findOne({ _id: id, isDeleted: false });
    if (!order) {
        throw new NotFoundError('Order not found');
    }

    // Kiểm tra quyền: chỉ admin hoặc người tạo đơn hàng
    if (order.userId.toString() !== userId && req.role !== ROLE.ADMIN) {
        throw new BadRequestError('Unauthorized to update this order');
    }

    // Cập nhật trạng thái và ghi chú admin (nếu có)
    order.status = status;
    if (adminNote && req.role === ROLE.ADMIN) {
        order.adminNote = adminNote;
    }
    if (status === OrderStatus.CANCELLED) {
        order.cancelBy = (req.role as ROLE) || ROLE.USER;
    }
    if (status === OrderStatus.DELIVERED) {
        order.isPaid = order.paymentMethod === 'COD' ? false : true;
    }
    await order.save();
    return res.status(200).json({ message: 'Order status updated successfully', order });
};
