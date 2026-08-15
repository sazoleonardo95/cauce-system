const router = require('express').Router();
const { getDashboardStats, getTeamPerformance } = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/stats', authorize('ADMIN', 'MANAGER'), getDashboardStats);
router.get('/team', authorize('ADMIN', 'MANAGER'), getTeamPerformance);

module.exports = router;
