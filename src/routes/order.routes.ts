import { orderController } from '@/controllers';
import { authenticate } from '@/middlewares/authenticateMiddleware';
import { Router } from 'express';

const router = Router();

// Tạo đơn COD
router.post('/create/cod', authenticate, orderController.createOrderCOD); // CREATE_ORDER_COD

// Tạo đơn online
router.post('/create/online', orderController.createOrderOnline); // CREATE_ORDER_ONLINE

// Lấy toàn bộ đơn hàng
router.get('/all', orderController.getAllOrders); // GET_ALL_ORDERS

// Lấy chi tiết đơn hàng theo id
router.get('/:id', orderController.getOrderDetail); // GET_ORDER_DETAIL

// Cập nhật đơn hàng theo id
router.patch('/update/:id', orderController.updateOrder); // UPDATE_ORDER

// Hủy đơn hàng theo id
router.patch('/cancel/:id', orderController.cancelOrder); // CANCEL_ORDER

// Xóa mềm đơn hàng theo id
router.delete('/soft-delete/:id', orderController.softDeleteOrder); // SOFT_DELETE_ORDER

// Khôi phục đơn hàng theo id
router.patch('/restore/:id', orderController.restoreOrder); // RESTORE_ORDER

// Thay đổi trạng thái đơn hàng theo id
router.patch('/status/:id', orderController.changeOrderStatus); // CHANGE_ORDER_STATUS

export default router;
