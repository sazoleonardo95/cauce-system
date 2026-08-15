const router = require('express').Router();
const { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } = require('../controllers/warehouseController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { warehouseSchema } = require('../utils/validations');

router.use(authenticate);

router.get('/', getWarehouses);
router.post('/', authorize('ADMIN', 'MANAGER'), validate(warehouseSchema), createWarehouse);
router.put('/:id', authorize('ADMIN', 'MANAGER'), updateWarehouse);
router.delete('/:id', authorize('ADMIN'), deleteWarehouse);

module.exports = router;
