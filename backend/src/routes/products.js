const router = require('express').Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getCategories } = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { productSchema } = require('../utils/validations');

router.use(authenticate);

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProduct);
router.post('/', authorize('ADMIN', 'MANAGER', 'WAREHOUSE'), validate(productSchema), createProduct);
router.put('/:id', authorize('ADMIN', 'MANAGER', 'WAREHOUSE'), updateProduct);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), deleteProduct);

module.exports = router;
