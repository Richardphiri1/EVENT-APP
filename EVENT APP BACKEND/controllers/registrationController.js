const pool = require('../config/db');

// Register a user for an event
const registerForEvent = async (req, res) => {
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

    // Check if event has capacity
    const eventCheck = await pool.query(
      'SELECT capacity, attendees FROM events WHERE id = $1',
      [eventId]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const { capacity, attendees } = eventCheck.rows[0];
    if (capacity > 0 && attendees >= capacity) {
      return res.status(400).json({ error: 'Event is full. Join the waitlist instead.' });
    }

    // Register
    const result = await pool.query(
      'INSERT INTO registrations (user_id, event_id) VALUES ($1, $2) RETURNING *',
      [userId, eventId]
    );

    // Update attendee count
    await pool.query(
      'UPDATE events SET attendees = attendees + 1 WHERE id = $1',
      [eventId]
    );

    res.status(201).json({ message: 'Registered successfully', registration: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all events a user is registered for
const getMyEvents = async (req, res) => {
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
};

// Unregister from an event
const unregisterFromEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Check if registered
    const check = await pool.query(
      'SELECT * FROM registrations WHERE user_id = $1 AND event_id = $2',
      [userId, eventId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    // Delete registration
    await pool.query(
      'DELETE FROM registrations WHERE user_id = $1 AND event_id = $2',
      [userId, eventId]
    );

    // Decrease attendee count
    await pool.query(
      'UPDATE events SET attendees = attendees - 1 WHERE id = $1',
      [eventId]
    );

    // Check waitlist and promote first person
    const waitlist = await pool.query(
      'SELECT * FROM waitlist WHERE event_id = $1 ORDER BY joined_at ASC LIMIT 1',
      [eventId]
    );

    if (waitlist.rows.length > 0) {
      const nextUser = waitlist.rows[0];
      
      // Promote to registration
      await pool.query(
        'INSERT INTO registrations (user_id, event_id) VALUES ($1, $2)',
        [nextUser.user_id, eventId]
      );
      
      // Update attendee count
      await pool.query(
        'UPDATE events SET attendees = attendees + 1 WHERE id = $1',
        [eventId]
      );
      
      // Remove from waitlist
      await pool.query(
        'DELETE FROM waitlist WHERE id = $1',
        [nextUser.id]
      );

      // Optional: You can also send a notification here
      console.log(`User ${nextUser.user_id} automatically registered for event ${eventId}`);
    }

    res.json({ message: 'Unregistered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerForEvent,
  getMyEvents,
  unregisterFromEvent
};