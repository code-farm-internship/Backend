import { orderController } from '@/controllers';
import { Router } from 'express';

const router = Router();

// Tạo đơn COD
router.post('/create/cod', orderController.createOrderCOD);

// Tạo đơn online
router.post('/create/online', orderController.createOrderOnline);

// Thay đổi trạng thái đơn theo id
router.patch('/status/:id', orderController.changeOrderStatus);

export default router;
