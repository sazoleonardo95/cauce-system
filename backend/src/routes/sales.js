const router = require('express').Router();
const { getSales, createSale, getSaleById, cancelSale } = require('../controllers/saleController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createSaleSchema } = require('../utils/validations');

router.use(authenticate);

router.get('/', getSales);
router.get('/:id', getSaleById);
router.post('/', authorize('ADMIN', 'MANAGER', 'SELLER'), validate(createSaleSchema), createSale);
router.patch('/:id/cancel', authorize('ADMIN', 'MANAGER'), cancelSale);

module.exports = router;
