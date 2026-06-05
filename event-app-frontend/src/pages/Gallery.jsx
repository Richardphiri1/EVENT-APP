import React, { useState, useEffect } from 'react';

function Gallery() {
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPastEvents();
  }, []);

  const fetchPastEvents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/events/past');
      const data = await response.json();
      setPastEvents(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching past events:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading gallery...</p>
      </div>
    );
  }

  return (
    <div className="events-container">
      <h2>🖼️ Past Events Gallery</h2>
      
      {pastEvents.length === 0 ? (
        <div className="empty-state">
          <h3>No past events</h3>
          <p>Past events will appear here once they've passed.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {pastEvents.map(event => (
            <div key={event.id} style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.06)',
              transition: 'all 0.3s ease'
            }}>
              {event.image_url ? (
                <img 
                  src={`http://localhost:5000${event.image_url}`} 
                  alt={event.title}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '200px',
                  background: 'rgba(255,255,255,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255,255,255,0.2)',
                  fontSize: '48px'
                }}>
                  📷
                </div>
              )}
              <div style={{ padding: '16px' }}>
                <h3 style={{ color: '#ffffff', fontSize: '18px', marginBottom: '4px' }}>{event.title}</h3>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.5)',
                    background: 'rgba(255,255,255,0.04)',
                    padding: '2px 10px',
                    borderRadius: '10px'
                  }}>
                    📅 {new Date(event.date).toLocaleDateString()}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.5)',
                    background: 'rgba(255,255,255,0.04)',
                    padding: '2px 10px',
                    borderRadius: '10px'
                  }}>
                    👥 {event.attendees || 0} attended
                  </span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.5' }}>
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Gallery;