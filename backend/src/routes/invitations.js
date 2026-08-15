const router = require('express').Router();
const { getInvitations, createInvitation, acceptInvitation, cancelInvitation, resendInvitation } = require('../controllers/invitationController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { inviteSchema } = require('../utils/validations');

router.get('/', authenticate, authorize('ADMIN', 'MANAGER'), getInvitations);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), validate(inviteSchema), createInvitation);
router.post('/accept', acceptInvitation);
router.patch('/:id/cancel', authenticate, authorize('ADMIN', 'MANAGER'), cancelInvitation);
router.post('/:id/resend', authenticate, authorize('ADMIN', 'MANAGER'), resendInvitation);

module.exports = router;
