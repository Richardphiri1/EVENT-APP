import React, { useState, useEffect } from 'react';

function AnalyticsDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchEvents();
    checkUserLoggedIn();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/events');
      const data = await response.json();
      setEvents(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  };

  const checkUserLoggedIn = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  };

  // Calculate statistics
  const totalEvents = events.length;
  const totalAttendees = events.reduce((sum, event) => sum + (event.attendees || 0), 0);
  
  // Find most popular event
  const mostPopularEvent = events.reduce((max, event) => 
    (event.attendees || 0) > (max.attendees || 0) ? event : max, 
    events[0] || { title: 'No events', attendees: 0 }
  );

  // Group events by location
  const locationStats = events.reduce((acc, event) => {
    const loc = event.location || 'Unknown';
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {});

  // Get recent events (last 5)
  const recentEvents = [...events]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="events-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <h2 style={{ margin: 0 }}>📊 Analytics Dashboard</h2>
        {user && user.role === 'admin' && (
          <span style={{
            background: 'rgba(200, 168, 78, 0.15)',
            color: '#c8a84e',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            letterSpacing: '0.5px'
          }}>
            Admin View
          </span>
        )}
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>📅</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff' }}>{totalEvents}</div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Total Events</div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>👥</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#c8a84e' }}>{totalAttendees}</div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Total Attendees</div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🏆</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>{mostPopularEvent.title}</div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
            {mostPopularEvent.attendees || 0} attendees
          </div>
        </div>
      </div>

      {/* Location Breakdown */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px'
      }}>
        <h3 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '18px' }}>📍 Events by Location</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {Object.entries(locationStats).length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>No location data available</p>
          ) : (
            Object.entries(locationStats).map(([location, count]) => (
              <div key={location} style={{
                background: 'rgba(200, 168, 78, 0.1)',
                border: '1px solid rgba(200, 168, 78, 0.15)',
                borderRadius: '12px',
                padding: '10px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ color: '#c8a84e', fontWeight: '600' }}>{location}</span>
                <span style={{
                  background: '#c8a84e',
                  color: '#0a1628',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: '700'
                }}>{count}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Events */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        padding: '24px'
      }}>
        <h3 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '18px' }}>📋 Recent Events</h3>
        {recentEvents.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>No events created yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentEvents.map(event => (
              <div key={event.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.04)'
              }}>
                <div>
                  <div style={{ color: '#ffffff', fontWeight: '600' }}>{event.title}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                    {new Date(event.date).toLocaleDateString()} • {event.location}
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                  👥 {event.attendees || 0}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsDashboard;