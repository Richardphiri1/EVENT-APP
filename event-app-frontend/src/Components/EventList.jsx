import React, { useState, useEffect } from 'react';

function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching events:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="events-container">
      <h2>🎯 Upcoming Events</h2>
      <div className="events-grid">
        {events.length === 0 ? (
          <div className="empty-state">
            <h3>No events found</h3>
            <p>Be the first to create an event!</p>
          </div>
        ) : (
          events.map(event => (
            <div key={event.id} className="event-card">
              {event.image_url && (
                <img src={`http://localhost:5000${event.image_url}`} alt={event.title} className="event-card-image" />
              )}
              <div className="event-card-body">
                <h3>{event.title}</h3>
                <div className="event-meta">
                  <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                  <span>🕐 {event.time}</span>
                  <span>📍 {event.location}</span>
                </div>
                <p className="event-description">{event.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default EventList;