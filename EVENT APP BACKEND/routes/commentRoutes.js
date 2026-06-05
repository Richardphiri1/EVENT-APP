const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Add a comment (authenticated users only)
router.post('/', authMiddleware, commentController.addComment);

// Get all comments for an event (public)
router.get('/:eventId', commentController.getEventComments);

// Delete a comment (authenticated users only)
router.delete('/:id', authMiddleware, commentController.deleteComment);

module.exports = router;