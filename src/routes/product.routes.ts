import { ROLE } from '@/constants/allowRoles';
import { productController } from '@/controllers';
import { authenticate } from '@/middlewares/authenticateMiddleware';
import { authorize } from '@/middlewares/authorizeMiddleware';
import { upload } from '@/middlewares/multerMiddleware';
import { createProductSchema, updateProductSchema } from '@/validations/product/productSchema';
import { validator } from '@/validations/schemaValidator';
import { createVariantSchema, updateVariantSchema } from '@/validations/variant/variantSchema';
import { Router } from 'express';

const router = Router();

// GET
router.get('/all', productController.getAllProducts);
router.get('/selling', productController.getBestSeller);
router.get('/featured', productController.getFeaturedProducts);
router.get('/new', productController.getNewProducts);
router.get(
    '/variant/:productId/all',
    authenticate,
    authorize(ROLE.MANAGER, ROLE.ADMIN),
    productController.getAllVariantsByProduct,
);
router.get('/:id', productController.getDetailProduct);

// POST
router.post(
    '/create',
    authenticate,
    authorize(ROLE.ADMIN),
    validator(createProductSchema),
    upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'library', maxCount: 7 },
    ]),
    productController.createProduct,
);

router.post(
    '/variant',
    authenticate,
    authorize(ROLE.MANAGER, ROLE.ADMIN),
    validator(createVariantSchema),
    upload.fields([{ name: 'variantImages', maxCount: 5 }]),
    productController.createProductVariant,
);

// PUT
router.put(
    '/update',
    authenticate,
    authorize(ROLE.ADMIN),
    validator(updateProductSchema),
    upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'library', maxCount: 7 },
    ]),
    productController.updateProduct,
);
router.put(
    '/variant/update',
    authenticate,
    authorize(ROLE.MANAGER, ROLE.ADMIN),
    validator(updateVariantSchema),
    upload.fields([{ name: 'variantImages', maxCount: 5 }]),
    productController.updateProductVariant,
);
// PATCH
router.patch('/hidden/:id', authenticate, authorize(ROLE.ADMIN), productController.hiddenProduct);

export default router;
