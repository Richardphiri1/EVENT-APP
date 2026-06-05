const pool = require('../config/db');

// Add a comment to an event
const addComment = async (req, res) => {
  try {
    const { eventId, comment } = req.body;
    const userId = req.user.id;

    if (!comment || comment.trim() === '') {
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }

    const result = await pool.query(
      'INSERT INTO event_comments (user_id, event_id, comment) VALUES ($1, $2, $3) RETURNING *',
      [userId, eventId, comment]
    );

    res.status(201).json({ message: 'Comment added successfully', comment: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all comments for an event
const getEventComments = async (req, res) => {
  try {
    const { eventId } = req.params;
    const result = await pool.query(
      `SELECT c.*, u.username 
       FROM event_comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.event_id = $1 
       ORDER BY c.created_at ASC`,
      [eventId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a comment (admin or comment owner)
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if user is admin or comment owner
    const check = await pool.query(
      'SELECT user_id FROM event_comments WHERE id = $1',
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (check.rows[0].user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to delete this comment' });
    }

    await pool.query('DELETE FROM event_comments WHERE id = $1', [id]);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addComment,
  getEventComments,
  deleteComment
};