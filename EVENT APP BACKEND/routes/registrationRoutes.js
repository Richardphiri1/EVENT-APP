const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Register for an event
router.post('/', authMiddleware, registrationController.registerForEvent);

// Get all events user is registered for
router.get('/my-events', authMiddleware, registrationController.getMyEvents);

// Unregister from an event
router.delete('/:eventId', authMiddleware, registrationController.unregisterFromEvent);

module.exports = router;