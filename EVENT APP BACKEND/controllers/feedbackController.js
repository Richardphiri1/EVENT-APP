const pool = require('../config/db');

// Submit feedback
const submitFeedback = async (req, res) => {
  try {
    const { eventId, rating, comment } = req.body;
    const userId = req.user.id;

    // Check if user attended the event
    const check = await pool.query(
      'SELECT * FROM registrations WHERE user_id = $1 AND event_id = $2',
      [userId, eventId]
    );

    if (check.rows.length === 0) {
      return res.status(400).json({ error: 'You must attend the event before giving feedback' });
    }

    // Check if user already submitted feedback
    const existing = await pool.query(
      'SELECT * FROM feedback WHERE user_id = $1 AND event_id = $2',
      [userId, eventId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'You have already submitted feedback for this event' });
    }

    // Insert feedback
    const result = await pool.query(
      'INSERT INTO feedback (user_id, event_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, eventId, rating, comment]
    );

    res.status(201).json({ message: 'Feedback submitted successfully', feedback: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get feedback for an event
const getEventFeedback = async (req, res) => {
  try {
    const { eventId } = req.params;
    const result = await pool.query(
      `SELECT f.*, u.username 
       FROM feedback f 
       JOIN users u ON f.user_id = u.id 
       WHERE f.event_id = $1 
       ORDER BY f.created_at DESC`,
      [eventId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get average rating for an event
const getEventRating = async (req, res) => {
  try {
    const { eventId } = req.params;
    const result = await pool.query(
      'SELECT AVG(rating) as average_rating, COUNT(*) as total_reviews FROM feedback WHERE event_id = $1',
      [eventId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  submitFeedback,
  getEventFeedback,
  getEventRating
};