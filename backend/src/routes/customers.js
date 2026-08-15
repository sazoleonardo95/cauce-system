const router = require('express').Router();
const { getCustomers, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customerController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { customerSchema } = require('../utils/validations');

router.use(authenticate);

router.get('/', getCustomers);
router.post('/', authorize('ADMIN', 'MANAGER', 'SELLER'), validate(customerSchema), createCustomer);
router.put('/:id', authorize('ADMIN', 'MANAGER', 'SELLER'), updateCustomer);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), deleteCustomer);

module.exports = router;
