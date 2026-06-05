import React, { useState, useEffect } from 'react';

function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackEventId, setFeedbackEventId] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

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

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId: feedbackEventId,
          rating: feedbackRating,
          comment: feedbackComment
        })
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to submit feedback');
        return;
      }

      alert('✅ Feedback submitted successfully!');
      setShowFeedbackModal(false);
      setFeedbackComment('');
      setFeedbackRating(5);
    } catch (error) {
      alert('Error submitting feedback: ' + error.message);
    }
  };

  const openFeedbackModal = (eventId) => {
    setFeedbackEventId(eventId);
    setShowFeedbackModal(true);
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
                  background: 'rgba(255,255,255,0.04)', 
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
                  <button 
                    className="btn btn-success" 
                    onClick={() => openFeedbackModal(event.id)}
                  >
                    ⭐ Rate Event
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="modal-overlay" onClick={() => setShowFeedbackModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>⭐ Rate this event</h2>
            <form onSubmit={handleFeedbackSubmit}>
              <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>How was the event?</p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFeedbackRating(num)}
                      style={{
                        background: feedbackRating >= num ? '#c8a84e' : 'rgba(255,255,255,0.05)',
                        border: 'none',
                        borderRadius: '8px',
                        width: '48px',
                        height: '48px',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: feedbackRating >= num ? '#0a1628' : 'rgba(255,255,255,0.3)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                placeholder="Write your feedback..."
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                required
              />
              <div className="modal-actions">
                <button type="submit" className="btn btn-success">Submit Feedback</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowFeedbackModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyEvents;