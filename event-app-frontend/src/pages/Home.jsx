import React, { useState, useEffect } from 'react';

function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
    checkUserLoggedIn();
  }, []);

  useEffect(() => {
    if (user) {
      fetchRegisteredEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  };

  const fetchRegisteredEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/registrations/my-events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch registered events');
      const data = await response.json();
      setRegisteredEvents(data.map(event => event.id));
    } catch (error) {
      console.error('Error fetching registered events:', error);
    }
  };

  const checkUserLoggedIn = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  };

  const handleRegisterEvent = async (eventId) => {
    if (!user) {
      alert('Please login first to register for events.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ eventId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      alert('✅ Successfully registered for the event!');
      fetchEvents();
      fetchRegisteredEvents();
    } catch (error) {
      alert('Error registering: ' + error.message);
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
      fetchEvents();
      fetchRegisteredEvents();
    } catch (error) {
      alert('Error unregistering: ' + error.message);
    }
  };

  const isRegistered = (eventId) => {
    return registeredEvents.includes(eventId);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading events...</p>
      </div>
    );
  }

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
                
                {/* Attendee Count */}
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
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    {event.attendees === 0 ? 'No registrations yet' : `${event.attendees} people going`}
                  </span>
                </div>

                <div className="event-card-actions">
                  {user && user.role === 'admin' && (
                    <>
                      <button className="btn btn-warning">✏️ Edit</button>
                      <button className="btn btn-danger">🗑️ Delete</button>
                    </>
                  )}
                  {user && user.role === 'user' && (
                    <>
                      {isRegistered(event.id) ? (
                        <button 
                          className="btn btn-danger" 
                          onClick={() => handleUnregisterEvent(event.id)}
                        >
                          ❌ Unregister
                        </button>
                      ) : (
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleRegisterEvent(event.id)}
                        >
                          📝 Register to Attend
                        </button>
                      )}
                    </>
                  )}
                  {!user && (
                    <button 
                      className="btn btn-outline" 
                      onClick={() => alert('Please login first to register for events.')}
                    >
                      🔒 Login to Register
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;