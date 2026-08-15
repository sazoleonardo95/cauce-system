const router = require('express').Router();
const { getInventory, adjustStock, getStockMovements } = require('../controllers/inventoryController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { stockMovementSchema } = require('../utils/validations');

router.use(authenticate);

router.get('/', getInventory);
router.get('/movements', getStockMovements);
router.post('/adjust', authorize('ADMIN', 'MANAGER', 'WAREHOUSE'), validate(stockMovementSchema), adjustStock);

module.exports = router;
