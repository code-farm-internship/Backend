import { discountController } from '@/controllers';
import { Router } from 'express';

const router = Router();

router.get('/all', discountController.getAllDiscounts);

// Tạo mới discount
router.post('/', discountController.createDiscount);

// Cập nhật discount theo id
router.put('/:id', discountController.updateDiscount);

// Xóa discount theo id
router.delete('/:id', discountController.deleteDiscount);

export default router;
