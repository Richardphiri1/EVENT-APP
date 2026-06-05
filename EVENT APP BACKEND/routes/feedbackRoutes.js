const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Submit feedback (authenticated users only)
router.post('/', authMiddleware, feedbackController.submitFeedback);

// Get feedback for an event (public)
router.get('/:eventId', feedbackController.getEventFeedback);

// Get average rating for an event (public)
router.get('/:eventId/rating', feedbackController.getEventRating);

module.exports = router;