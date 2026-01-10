import { Router } from 'express';

import {
  createProduct,
  getProduct,
  getAllProducts,
  getProductsBySalon,
  updateProduct,
  deleteProduct,
  searchProducts,
} from '@/controllers/productController';
import { authenticate } from '@/middlewares/auth/authenticate';
import { uploadProductImages, handleMulterError } from '@/middlewares/uploadMiddleware';
import { validateRequest } from '@/middlewares/validateRequest';
import {
  createProductSchema,
  updateProductSchema,
  getProductParamsSchema,
  getProductQuerySchema,
  getSalonProductsParamsSchema,
  searchProductsQuerySchema,
} from '@/schemas/productSchema';

const router = Router();

// Public route to search products with fuzzy matching
router.get('/search', validateRequest({ query: searchProductsQuerySchema }), searchProducts);

// Public route to get all products with pagination and filtering
router.get('/', validateRequest({ query: getProductQuerySchema }), getAllProducts);

// Public route to get all products for a specific salon
router.get(
  '/salon/:salonId',
  validateRequest({ params: getSalonProductsParamsSchema, query: getProductQuerySchema }),
  getProductsBySalon
);

// Public route to get a specific product by ID
router.get('/:id', validateRequest({ params: getProductParamsSchema }), getProduct);

// Protected route to create a new product (salon owners only)
router.post(
  '/',
  authenticate,
  uploadProductImages,
  handleMulterError,
  validateRequest({ body: createProductSchema }),
  createProduct
);

// Protected route to update a product (salon owners only)
router.patch(
  '/:id',
  authenticate,
  uploadProductImages,
  handleMulterError,
  validateRequest({ params: getProductParamsSchema, body: updateProductSchema }),
  updateProduct
);

// Protected route to delete a product (salon owners only)
router.delete(
  '/:id',
  authenticate,
  validateRequest({ params: getProductParamsSchema }),
  deleteProduct
);

export default router;
