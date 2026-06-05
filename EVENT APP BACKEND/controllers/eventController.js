const pool = require('../config/db');

// Get all events with attendee count
const getAllEvents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, 
        COUNT(DISTINCT r.id) as attendees, 
        COUNT(DISTINCT w.id) as waitlist_count
       FROM events e 
       LEFT JOIN registrations r ON e.id = r.event_id 
       LEFT JOIN waitlist w ON e.id = w.event_id
       GROUP BY e.id 
       ORDER BY e.date DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all past events (for gallery)
const getPastEvents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, 
        COUNT(DISTINCT r.id) as attendees, 
        COUNT(DISTINCT w.id) as waitlist_count
       FROM events e 
       LEFT JOIN registrations r ON e.id = r.event_id 
       LEFT JOIN waitlist w ON e.id = w.event_id
       WHERE e.date < NOW()
       GROUP BY e.id 
       ORDER BY e.date DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single event by ID with attendee count
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT e.*, 
        COUNT(DISTINCT r.id) as attendees, 
        COUNT(DISTINCT w.id) as waitlist_count
       FROM events e 
       LEFT JOIN registrations r ON e.id = r.event_id 
       LEFT JOIN waitlist w ON e.id = w.event_id
       WHERE e.id = $1 
       GROUP BY e.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new event (admin only)
const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, category, capacity } = req.body;
    const created_by = req.user.id;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      `INSERT INTO events (title, description, date, time, location, image_url, created_by, category, capacity) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [title, description, date, time, location, image_url, created_by, category || 'General', capacity || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an event (admin only)
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, time, location, category, capacity } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    let query;
    let params;

    if (image_url) {
      query = `UPDATE events SET title = $1, description = $2, date = $3, time = $4, location = $5, category = $6, capacity = $7, image_url = $8 WHERE id = $9 RETURNING *`;
      params = [title, description, date, time, location, category, capacity, image_url, id];
    } else {
      query = `UPDATE events SET title = $1, description = $2, date = $3, time = $4, location = $5, category = $6, capacity = $7 WHERE id = $8 RETURNING *`;
      params = [title, description, date, time, location, category, capacity, id];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an event (admin only)
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM registrations WHERE event_id = $1', [id]);
    await pool.query('DELETE FROM waitlist WHERE event_id = $1', [id]);

    const result = await pool.query(
      'DELETE FROM events WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllEvents,
  getPastEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};