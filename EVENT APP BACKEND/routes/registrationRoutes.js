const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/authMiddleware');

// Register a user for an event
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user.id;

    // Check if already registered
    const check = await pool.query(
      'SELECT * FROM registrations WHERE user_id = $1 AND event_id = $2',
      [userId, eventId]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }

    // Register
    const result = await pool.query(
      'INSERT INTO registrations (user_id, event_id) VALUES ($1, $2) RETURNING *',
      [userId, eventId]
    );

    res.status(201).json({ message: 'Registered successfully', registration: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all events a user is registered for
router.get('/my-events', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT e.*, COUNT(r.id) as attendees 
       FROM events e 
       JOIN registrations r ON e.id = r.event_id 
       WHERE r.user_id = $1 
       GROUP BY e.id 
       ORDER BY e.date DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unregister from an event
router.delete('/:eventId', authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM registrations WHERE user_id = $1 AND event_id = $2 RETURNING *',
      [userId, eventId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.json({ message: 'Unregistered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;