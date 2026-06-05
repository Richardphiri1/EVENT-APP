const pool = require('../config/db');

// Join waitlist
const joinWaitlist = async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user.id;

    // Check if already on waitlist
    const check = await pool.query(
      'SELECT * FROM waitlist WHERE user_id = $1 AND event_id = $2',
      [userId, eventId]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({ error: 'Already on waitlist for this event' });
    }

    // Check if event is full
    const eventCheck = await pool.query(
      'SELECT capacity, attendees FROM events WHERE id = $1',
      [eventId]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const { capacity, attendees } = eventCheck.rows[0];
    if (attendees < capacity) {
      return res.status(400).json({ error: 'Event is not full. Please register instead.' });
    }

    // Add to waitlist
    await pool.query(
      'INSERT INTO waitlist (user_id, event_id) VALUES ($1, $2)',
      [userId, eventId]
    );

    // Update waitlist count
    await pool.query(
      'UPDATE events SET waitlist_count = waitlist_count + 1 WHERE id = $1',
      [eventId]
    );

    res.status(201).json({ message: 'Added to waitlist successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get events user is on waitlist for
const getMyWaitlistEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT e.* 
       FROM events e 
       JOIN waitlist w ON e.id = w.event_id 
       WHERE w.user_id = $1 
       ORDER BY e.date DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Leave waitlist
const leaveWaitlist = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM waitlist WHERE user_id = $1 AND event_id = $2 RETURNING *',
      [userId, eventId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not on waitlist for this event' });
    }

    await pool.query(
      'UPDATE events SET waitlist_count = waitlist_count - 1 WHERE id = $1',
      [eventId]
    );

    res.json({ message: 'Removed from waitlist successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  joinWaitlist,
  getMyWaitlistEvents,
  leaveWaitlist
};