import { categoryController } from '@/controllers';
import { upload } from '@/middlewares/multerMiddleware';
import { createCategorySchema, updateCategorySchema } from '@/validations/category/categorySchema';
import { validator } from '@/validations/schemaValidator';
import { Router } from 'express';

const router = Router();

router.get('/all', categoryController.getAllCategories);
router.get('/:id', categoryController.getDetailCategory);

router.post('/create', upload.single('image'), validator(createCategorySchema), categoryController.createCategory);

router.put('/update/:id', upload.single('image'), validator(updateCategorySchema), categoryController.updateCategory);

router.delete('/delete/:id', categoryController.deleteCategory);

export default router;
