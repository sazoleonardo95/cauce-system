const router = require('express').Router();
const { getNotifications, markAsRead, markAllAsRead, registerToken } = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);
router.post('/register-token', registerToken);

module.exports = router;
