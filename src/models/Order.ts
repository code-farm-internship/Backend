import { ROLE } from '@/constants/allowRoles';
import { OrderStatus, TransactionStatus } from '@/constants/enum';
import mongoose, { Schema } from 'mongoose';

const orderItemSchema = new Schema(
    {
        productVariantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductVariant',
            required: true,
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },

        name: {
            type: String,
            required: true,
        },

        quantity: {
            type: Number,
            required: true,
        },

        price: {
            type: Number,
            required: true,
        },

        isReviewed: {
            type: Boolean,
            default: false,
        },

        isReviewedDisabled: {
            type: Boolean,
            default: false,
        },
    },
    {
        _id: false,
    },
);

const addressSchema = new Schema(
    {
        detailAddress: { type: String, required: true },
        province: { type: String, required: true },
        district: { type: String, required: true },
        ward: { type: String, required: true },
    },
    {
        _id: false,
    });

const orderSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [orderItemSchema],
        customerInfo: {
            username: String,
            phoneNumber: String,
            email: String,
        },

        receiverInfo: {
            username: String,
            phoneNumber: String,
            email: String,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        shippingAddress: {
            type: addressSchema,
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(OrderStatus),
            default: OrderStatus.PENDING,
        },

        isPaid: {
            type: Boolean,
            default: false,
        },

        paymentStatus: {
            type: String,
            enum: Object.values(TransactionStatus),
            default: TransactionStatus.PENDING,
        },

        paymentMethod: {
            type: String,
        },

        transactionId: {
            type: String,
        },
        shippingFee: {
            type: Number,
            default: 0,
        },
        description: {
            type: String,
        },
        trackingNumber: {
            type: Number,
        },
        userNote: {
            type: String,
        },
        adminNote: {
            type: String,
        },
        cancelBy: {
            type: String,
            enum: Object.values(ROLE),
            default: ROLE.USER,
        },
        couponId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Coupon',
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
