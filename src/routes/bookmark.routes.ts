import { bookmarkController } from '@/controllers';
import { Router } from 'express';

const router = Router();

// Lấy tất cả bookmark
router.get('/all', bookmarkController.getAllBookmarks);

// Tạo bookmark mới
router.post('/', bookmarkController.createBookmark);

// Xóa bookmark theo id
router.delete('/:id', bookmarkController.deleteBookmark);

export default router;
