import Joi from 'joi';
import { OrderStatus } from '@/constants/enum';
import { ROLE } from '@/constants/allowRoles';


// Schema cho mỗi mục trong đơn hàng
export const orderItemSchema = Joi.object({
  productVariantId: Joi.string()
    .hex()
    .length(24)
    .trim()
    .required()
    .messages({
      'string.empty': 'ID biến thể sản phẩm không được để trống',
      'any.required': 'ID biến thể sản phẩm là bắt buộc',
      'string.base': 'ID biến thể sản phẩm phải là chuỗi',
      'string.hex': 'ID biến thể sản phẩm phải là chuỗi hex hợp lệ',
      'string.length': 'ID biến thể sản phẩm phải có độ dài 24 ký tự',
    }),
  productId: Joi.string()
    .hex()
    .length(24)
    .trim()
    .required()
    .messages({
      'string.empty': 'ID sản phẩm không được để trống',
      'any.required': 'ID sản phẩm là bắt buộc',
      'string.base': 'ID sản phẩm phải là chuỗi',
      'string.hex': 'ID sản phẩm phải là chuỗi hex hợp lệ',
      'string.length': 'ID sản phẩm phải có độ dài 24 ký tự',
    }),
  name: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.empty': 'Tên sản phẩm không được để trống',
      'any.required': 'Tên sản phẩm là bắt buộc',
      'string.base': 'Tên sản phẩm phải là chuỗi',
      'string.min': 'Tên sản phẩm phải lớn hơn hoặc bằng 1 ký tự',
      'string.max': 'Tên sản phẩm phải nhỏ hơn hoặc bằng 100 ký tự',
    }),
  quantity: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'Số lượng phải là số nguyên',
      'any.required': 'Số lượng là bắt buộc',
      'number.min': 'Số lượng phải lớn hơn hoặc bằng 1',
    }),
  price: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Giá phải là số',
      'any.required': 'Giá là bắt buộc',
      'number.min': 'Giá không được âm',
    }),
});

// Schema cho địa chỉ giao hàng
export const shippingAddressSchema = Joi.object({
  detailAddress: Joi.string()
    .min(1)
    .max(200)
    .trim()
    .required()
    .messages({
      'string.empty': 'Địa chỉ chi tiết không được để trống',
      'any.required': 'Địa chỉ chi tiết là bắt buộc',
      'string.base': 'Địa chỉ chi tiết phải là chuỗi',
      'string.min': 'Địa chỉ chi tiết phải lớn hơn hoặc bằng 1 ký tự',
      'string.max': 'Địa chỉ chi tiết phải nhỏ hơn hoặc bằng 200 ký tự',
    }),
  province: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.empty': 'Tỉnh/thành phố không được để trống',
      'any.required': 'Tỉnh/thành phố là bắt buộc',
      'string.base': 'Tỉnh/thành phố phải là chuỗi',
      'string.min': 'Tỉnh/thành phố phải lớn hơn hoặc bằng 1 ký tự',
      'string.max': 'Tỉnh/thành phố phải nhỏ hơn hoặc bằng 100 ký tự',
    }),
  district: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.empty': 'Quận/huyện không được để trống',
      'any.required': 'Quận/huyện là bắt buộc',
      'string.base': 'Quận/huyện phải là chuỗi',
      'string.min': 'Quận/huyện phải lớn hơn hoặc bằng 1 ký tự',
      'string.max': 'Quận/huyện phải nhỏ hơn hoặc bằng 100 ký tự',
    }),
  ward: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.empty': 'Phường/xã không được để trống',
      'any.required': 'Phường/xã là bắt buộc',
      'string.base': 'Phường/xã phải là chuỗi',
      'string.min': 'Phường/xã phải lớn hơn hoặc bằng 1 ký tự',
      'string.max': 'Phường/xã phải nhỏ hơn hoặc bằng 100 ký tự',
    }),
});

// Schema cho thông tin khách hàng hoặc người nhận
export const customerInfoSchema = Joi.object({
  username: Joi.string()
    .min(1)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.empty': 'Tên người dùng không được để trống',
      'any.required': 'Tên người dùng là bắt buộc',
      'string.base': 'Tên người dùng phải là chuỗi',
      'string.min': 'Tên người dùng phải lớn hơn hoặc bằng 1 ký tự',
      'string.max': 'Tên người dùng phải nhỏ hơn hoặc bằng 50 ký tự',
    }),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.empty': 'Số điện thoại không được để trống',
      'any.required': 'Số điện thoại là bắt buộc',
      'string.base': 'Số điện thoại phải là chuỗi',
      'string.pattern.base': 'Số điện thoại phải là 10 chữ số',
    }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.empty': 'Email không được để trống',
      'any.required': 'Email là bắt buộc',
      'string.base': 'Email phải là chuỗi',
      'string.email': 'Định dạng email không hợp lệ',
    }),
});

// Schema cho tạo đơn hàng COD
export const createOrderCODSchema = Joi.object({
  items: Joi.array()
    .items(orderItemSchema)
    .min(1)
    .required()
    .messages({
      'array.min': 'Danh sách mục không được để trống',
      'any.required': 'Danh sách mục là bắt buộc',
      'array.base': 'Danh sách mục phải là mảng',
    }),
  customerInfo: customerInfoSchema.required().messages({
    'any.required': 'Thông tin khách hàng là bắt buộc',
    'object.base': 'Thông tin khách hàng phải là đối tượng',
  }),
  receiverInfo: customerInfoSchema.required().messages({
    'any.required': 'Thông tin người nhận là bắt buộc',
    'object.base': 'Thông tin người nhận phải là đối tượng',
  }),
  shippingAddress: shippingAddressSchema.required().messages({
    'any.required': 'Địa chỉ giao hàng là bắt buộc',
    'object.base': 'Địa chỉ giao hàng phải là đối tượng',
  }),
  couponCode: Joi.string()
    .min(1)
    .max(50)
    .trim()
    .optional()
    .messages({
      'string.base': 'Mã giảm giá phải là chuỗi',
      'string.min': 'Mã giảm giá phải lớn hơn hoặc bằng 1 ký tự',
      'string.max': 'Mã giảm giá phải nhỏ hơn hoặc bằng 50 ký tự',
    }),
  userNote: Joi.string()
    .min(1)
    .max(500)
    .trim()
    .optional()
    .messages({
      'string.base': 'Ghi chú phải là chuỗi',
      'string.min': 'Ghi chú phải lớn hơn hoặc bằng 1 ký tự',
      'string.max': 'Ghi chú phải nhỏ hơn hoặc bằng 500 ký tự',
    }),
  shippingFee: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Phí vận chuyển phải là số',
      'number.min': 'Phí vận chuyển không được âm',
    }),
});

// Schema cho tạo đơn hàng thanh toán online
export const createOrderOnlineSchema = Joi.object({
  items: Joi.array()
    .items(orderItemSchema)
    .min(1)
    .required()
    .messages({
      'array.min': 'Danh sách mục không được để trống',
      'any.required': 'Danh sách mục là bắt buộc',
      'array.base': 'Danh sách mục phải là mảng',
    }),
  customerInfo: customerInfoSchema.required().messages({
    'any.required': 'Thông tin khách hàng là bắt buộc',
    'object.base': 'Thông tin khách hàng phải là đối tượng',
  }),
  receiverInfo: customerInfoSchema.required().messages({
    'any.required': 'Thông tin người nhận là bắt buộc',
    'object.base': 'Thông tin người nhận phải là đối tượng',
  }),
  shippingAddress: shippingAddressSchema.required().messages({
    'any.required': 'Địa chỉ giao hàng là bắt buộc',
    'object.base': 'Địa chỉ giao hàng phải là đối tượng',
  }),
  couponCode: Joi.string()
    .min(1)
    .max(50)
    .trim()
    .optional()
    .messages({
      'string.base': 'Mã giảm giá phải là chuỗi',
      'string.min': 'Mã giảm giá phải lớn hơn hoặc bằng 1 ký tự',
      'string.max': 'Mã giảm giá phải nhỏ hơn hoặc bằng 50 ký tự',
    }),
  paymentDetails: Joi.object({
    method: Joi.string()
      .min(1)
      .max(50)
      .trim()
      .required()
      .messages({
        'string.empty': 'Phương thức thanh toán không được để trống',
        'any.required': 'Phương thức thanh toán là bắt buộc',
        'string.base': 'Phương thức thanh toán phải là chuỗi',
        'string.min': 'Phương thức thanh toán phải lớn hơn hoặc bằng 1 ký tự',
        'string.max': 'Phương thức thanh toán phải nhỏ hơn hoặc bằng 50 ký tự',
      }),
    transactionId: Joi.string()
      .min(1)
      .max(100)
      .trim()
      .optional()
      .messages({
        'string.base': 'ID giao dịch phải là chuỗi',
        'string.min': 'ID giao dịch phải lớn hơn hoặc bằng 1 ký tự',
        'string.max': 'ID giao dịch phải nhỏ hơn hoặc bằng 100 ký tự',
      }),
  })
    .required()
    .messages({
      'any.required': 'Chi tiết thanh toán là bắt buộc',
      'object.base': 'Chi tiết thanh toán phải là đối tượng',
    }),
  userNote: Joi.string()
    .min(1)
    .max(500)
    .trim()
    .optional()
    .messages({
      'string.base': 'Ghi chú phải là chuỗi',
      'string.min': 'Ghi chú phải lớn hơn hoặc bằng 1 ký tự',
      'string.max': 'Ghi chú phải nhỏ hơn hoặc bằng 500 ký tự',
    }),
  shippingFee: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Phí vận chuyển phải là số',
      'number.min': 'Phí vận chuyển không được âm',
    }),
});

// Schema cho cập nhật đơn hàng
export const updateOrderSchema = Joi.object({
  items: Joi.array()
    .items(orderItemSchema)
    .min(1)
    .optional()
    .messages({
      'array.min': 'Danh sách mục không được để trống',
      'array.base': 'Danh sách mục phải là mảng',
    }),
  customerInfo: customerInfoSchema.optional().messages({
    'object.base': 'Thông tin khách hàng phải là đối tượng',
  }),
  receiverInfo: customerInfoSchema.optional().messages({
    'object.base': 'Thông tin người nhận phải là đối tượng',
  }),
  shippingAddress: shippingAddressSchema.optional().messages({
    'object.base': 'Địa chỉ giao hàng phải là đối tượng',
  }),
  userNote: Joi.string()
    .min(1)
    .max(500)
    .trim()
    .optional()
    .messages({
      'string.base': 'Ghi chú phải là chuỗi',
      'string.min': 'Ghi chú phải lớn hơn hoặc bằng 1 ký tự',
      'string.max': 'Ghi chú phải nhỏ hơn hoặc bằng 500 ký tự',
    }),
  shippingFee: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Phí vận chuyển phải là số',
      'number.min': 'Phí vận chuyển không được âm',
    }),
})
  .min(1)
  .messages({
    'object.min': 'Phải cung cấp ít nhất một trường để cập nhật',
  });

// Schema cho thay đổi trạng thái đơn hàng
export const changeOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(OrderStatus))
    .required()
    .messages({
      'string.empty': 'Trạng thái đơn hàng không được để trống',
      'any.required': 'Trạng thái đơn hàng là bắt buộc',
      'string.base': 'Trạng thái đơn hàng phải là chuỗi',
      'any.only': 'Trạng thái đơn hàng không hợp lệ',
    }),
  adminNote: Joi.string()
    .min(1)
    .max(500)
    .trim()
    .optional()
    .messages({
      'string.base': 'Ghi chú quản trị phải là chuỗi',
      'string.min': 'Ghi chú quản trị phải lớn hơn hoặc bằng 1 ký tự',
      'string.max': 'Ghi chú quản trị phải nhỏ hơn hoặc bằng 500 ký tự',
    }),
  cancelBy: Joi.string()
    .valid(...Object.values(ROLE))
    .optional()
    .messages({
      'string.base': 'Người hủy phải là chuỗi',
      'any.only': 'Người hủy không hợp lệ',
    }),
});