const express = require('express');
const router = express.Router();
const waitlistController = require('../controllers/waitlistController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Join waitlist
router.post('/', authMiddleware, waitlistController.joinWaitlist);

// Get events user is on waitlist for
router.get('/my-events', authMiddleware, waitlistController.getMyWaitlistEvents);

// Leave waitlist
router.delete('/:eventId', authMiddleware, waitlistController.leaveWaitlist);

module.exports = router;