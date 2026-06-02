import React, { useState, useEffect } from 'react';

function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/registrations/my-events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching my events:', error);
      setLoading(false);
    }
  };

  const handleUnregisterEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to unregister from this event?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/registrations/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Unregistration failed');
      }

      alert('✅ Successfully unregistered from the event!');
      fetchMyEvents();
    } catch (error) {
      alert('Error unregistering: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading your events...</p>
      </div>
    );
  }

  return (
    <div className="events-container">
      <h2>📋 My Registered Events</h2>
      <div className="events-grid">
        {events.length === 0 ? (
          <div className="empty-state">
            <h3>No events registered</h3>
            <p>Register for an event to see it here.</p>
          </div>
        ) : (
          events.map(event => (
            <div key={event.id} className="event-card">
              {event.image_url && (
                <img 
                  src={`http://localhost:5000${event.image_url}`} 
                  alt={event.title} 
                  className="event-card-image" 
                />
              )}
              <div className="event-card-body">
                <h3>{event.title}</h3>
                <div className="event-meta">
                  <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                  <span>🕐 {event.time}</span>
                  <span>📍 {event.location}</span>
                </div>
                <p className="event-description">{event.description}</p>
                <div style={{ 
                  marginTop: '10px', 
                  padding: '8px', 
                  background: '#f0f0f0', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>👥 Attendees: <strong>{event.attendees || 0}</strong></span>
                </div>
                <div className="event-card-actions" style={{ marginTop: '15px' }}>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => handleUnregisterEvent(event.id)}
                  >
                    ❌ Unregister
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MyEvents;