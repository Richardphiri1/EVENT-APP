import React, { useState, useEffect } from 'react';
import CommentSection from '../components/CommentSection';

function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [registeredEventIds, setRegisteredEventIds] = useState([]);
  const [waitlistEventIds, setWaitlistEventIds] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackEventId, setFeedbackEventId] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [eventRatings, setEventRatings] = useState({});
  
  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editCategory, setEditCategory] = useState('General');
  const [editImage, setEditImage] = useState(null);

  useEffect(() => {
    fetchEvents();
    checkUserLoggedIn();
  }, []);

  useEffect(() => {
    if (user) {
      fetchRegisteredEvents();
      fetchWaitlistEvents();
    }
  }, [user]);

  useEffect(() => {
    // Fetch ratings for all events
    events.forEach(event => {
      fetchEventRating(event.id);
    });
  }, [events]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/events');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const uniqueLocations = [...new Set(data.map(event => event.location).filter(Boolean))];
        const uniqueCategories = [...new Set(data.map(event => event.category).filter(Boolean))];
        setLocations(uniqueLocations);
        setCategories(uniqueCategories);
        
        if (user) {
          const token = localStorage.getItem('token');
          const regResponse = await fetch('http://localhost:5000/api/registrations/my-events', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (regResponse.ok) {
            const regData = await regResponse.json();
            const registeredIds = regData.map(event => event.id);
            setRegisteredEventIds(registeredIds);
            const availableEvents = data.filter(event => !registeredIds.includes(event.id));
            setEvents(availableEvents);
          } else {
            setEvents(data);
          }
        } else {
          setEvents(data);
        }
      } else {
        setEvents([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
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
      if (response.ok) {
        const data = await response.json();
        setRegisteredEventIds(data.map(event => event.id));
      }
    } catch (error) {
      console.error('Error fetching registered events:', error);
    }
  };

  const fetchWaitlistEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/waitlist/my-events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setWaitlistEventIds(data.map(event => event.id));
      }
    } catch (error) {
      console.error('Error fetching waitlist events:', error);
    }
  };

  const fetchEventRating = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/feedback/${eventId}/rating`);
      const data = await response.json();
      setEventRatings(prev => ({
        ...prev,
        [eventId]: data
      }));
    } catch (error) {
      console.error('Error fetching rating:', error);
    }
  };

  const checkUserLoggedIn = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  };

  const handleAttendClick = (eventId) => {
    if (!user) {
      alert('Please login first.');
      return;
    }
    if (user.role === 'admin') {
      alert('Admins cannot attend events.');
      return;
    }
    setSelectedEventId(eventId);
    setShowConfirmModal(true);
  };

  const handleConfirmAttendance = async (willAttend) => {
    setShowConfirmModal(false);
    
    if (!willAttend) {
      alert('No problem! You can decide later.');
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
        body: JSON.stringify({ eventId: selectedEventId })
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Registration failed');
        return;
      }

      alert('✅ You are now attending this event!');
      setEvents(prevEvents => prevEvents.filter(e => e.id !== selectedEventId));
      setRegisteredEventIds(prev => [...prev, selectedEventId]);
      
    } catch (error) {
      alert('Error registering: ' + error.message);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to delete event');
        return;
      }
      
      alert('Event deleted successfully!');
      window.location.reload();
    } catch (error) {
      alert('Error deleting event: ' + error.message);
    }
  };

  const openEditForm = (event) => {
    setEditingEvent(event);
    setEditTitle(event.title);
    setEditDescription(event.description);
    setEditDate(event.date.split('T')[0]);
    setEditTime(event.time);
    setEditLocation(event.location);
    setEditCategory(event.category || 'General');
    setEditImage(null);
    setShowEditModal(true);
  };

  const handleEditEvent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', editTitle);
      formData.append('description', editDescription);
      formData.append('date', editDate);
      formData.append('time', editTime);
      formData.append('location', editLocation);
      formData.append('category', editCategory);
      if (editImage) {
        formData.append('eventImage', editImage);
      }

      const response = await fetch(`http://localhost:5000/api/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to update event');
        return;
      }
      
      alert('✅ Event updated successfully!');
      setShowEditModal(false);
      setEditingEvent(null);
      window.location.reload();
    } catch (error) {
      alert('Error updating event: ' + error.message);
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
      fetchEventRating(feedbackEventId);
    } catch (error) {
      alert('Error submitting feedback: ' + error.message);
    }
  };

  const openFeedbackModal = (eventId) => {
    setFeedbackEventId(eventId);
    setShowFeedbackModal(true);
  };

  // Waitlist functions
  const joinWaitlist = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ eventId })
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to join waitlist');
        return;
      }

      alert('✅ Added to waitlist! You will be notified when a spot opens.');
      fetchEvents();
    } catch (error) {
      alert('Error joining waitlist: ' + error.message);
    }
  };

  const leaveWaitlist = async (eventId) => {
    if (!window.confirm('Are you sure you want to leave the waitlist?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/waitlist/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to leave waitlist');
        return;
      }

      alert('✅ Removed from waitlist.');
      fetchEvents();
    } catch (error) {
      alert('Error leaving waitlist: ' + error.message);
    }
  };

  // Filter events based on search term, location, and category
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = filterLocation === 'all' || event.location === filterLocation;
    const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
    return matchesSearch && matchesLocation && matchesCategory;
  });

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <h2 style={{ margin: 0 }}>🎯 Upcoming Events</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="🔍 Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: 'white',
              fontSize: '14px',
              width: '200px',
              outline: 'none'
            }}
          />
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: 'white',
              fontSize: '14px',
              outline: 'none'
            }}
          >
            <option value="all">All Locations</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: 'white',
              fontSize: '14px',
              outline: 'none'
            }}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="events-grid">
        {filteredEvents.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <h3>No events found</h3>
            <p>{searchTerm || filterLocation !== 'all' || filterCategory !== 'all' ? 'Try adjusting your search or filters.' : 'Be the first to create an event!'}</p>
          </div>
        ) : (
          filteredEvents.map(event => (
            <div key={event.id} className="event-card">
              {event.image_url && (
                <img 
                  src={`http://localhost:5000${event.image_url}`} 
                  alt={event.title} 
                  className="event-card-image" 
                />
              )}
              <div className="event-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h3 style={{ margin: 0 }}>{event.title}</h3>
                  <span style={{
                    background: 'rgba(200, 168, 78, 0.15)',
                    color: '#c8a84e',
                    padding: '2px 12px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {event.category || 'General'}
                  </span>
                </div>
                <div className="event-meta">
                  <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                  <span>🕐 {event.time}</span>
                  <span>📍 {event.location}</span>
                </div>
                <p className="event-description">{event.description}</p>
                
                <div className="attendee-box">
                  <span>👥 Attendees: <strong>{event.attendees || 0}</strong></span>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                    {event.attendees === 0 ? 'No registrations yet' : `${event.attendees} people going`}
                  </span>
                </div>

                {event.capacity > 0 && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.5)'
                  }}>
                    📊 {event.attendees || 0} / {event.capacity} spots filled
                    {event.waitlist_count > 0 && ` • ⏳ ${event.waitlist_count} on waitlist`}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>⭐</span>
                  <span style={{ fontSize: '13px', color: '#c8a84e', fontWeight: '600' }}>
                    {eventRatings[event.id]?.average_rating 
                      ? Number(eventRatings[event.id].average_rating).toFixed(1) 
                      : 'No ratings'}
                  </span>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                    ({eventRatings[event.id]?.total_reviews || 0} reviews)
                  </span>
                </div>

                <div className="event-card-actions">
                  {user && user.role === 'admin' ? (
                    <>
                      <button className="btn btn-warning" onClick={() => openEditForm(event)}>✏️ Edit</button>
                      <button className="btn btn-danger" onClick={() => handleDeleteEvent(event.id)}>🗑️ Delete</button>
                    </>
                  ) : user && user.role === 'user' ? (
                    waitlistEventIds.includes(event.id) ? (
                      <button 
                        className="btn btn-warning" 
                        onClick={() => leaveWaitlist(event.id)}
                      >
                        ⏳ Leave Waitlist
                      </button>
                    ) : event.attendees >= event.capacity && event.capacity > 0 ? (
                      <button 
                        className="btn btn-success" 
                        onClick={() => joinWaitlist(event.id)}
                      >
                        ⏳ Join Waitlist
                      </button>
                    ) : (
                      <button className="btn btn-primary" onClick={() => handleAttendClick(event.id)}>
                        📝 Attend?
                      </button>
                    )
                  ) : (
                    <button className="btn btn-outline" onClick={() => alert('Please login first.')}>
                      🔒 Login to Attend
                    </button>
                  )}
                </div>

                {/* Comment Section */}
                {user && user.role === 'user' && (
                  <CommentSection eventId={event.id} user={user} />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirm Attendance Modal */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>📝 Will you attend?</h2>
            <p style={{ textAlign: 'center', margin: '20px 0', fontSize: '18px', color: 'rgba(255,255,255,0.8)' }}>
              Please confirm your attendance for this event.
            </p>
            <div className="modal-actions" style={{ justifyContent: 'center', gap: '20px' }}>
              <button 
                className="btn btn-success" 
                onClick={() => handleConfirmAttendance(true)}
                style={{ minWidth: '120px' }}
              >
                ✅ Yes, I will attend
              </button>
              <button 
                className="btn btn-danger" 
                onClick={() => handleConfirmAttendance(false)}
                style={{ minWidth: '120px' }}
              >
                ❌ No, I won't attend
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Edit Event Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>✏️ Edit Event</h2>
            <form onSubmit={handleEditEvent}>
              <input 
                type="text" 
                placeholder="Event Title" 
                value={editTitle} 
                onChange={(e) => setEditTitle(e.target.value)} 
                required 
              />
              <textarea 
                placeholder="Description" 
                value={editDescription} 
                onChange={(e) => setEditDescription(e.target.value)} 
                required 
              />
              <input 
                type="date" 
                value={editDate} 
                onChange={(e) => setEditDate(e.target.value)} 
                required 
              />
              <input 
                type="time" 
                value={editTime} 
                onChange={(e) => setEditTime(e.target.value)} 
                required 
              />
              <input 
                type="text" 
                placeholder="Location" 
                value={editLocation} 
                onChange={(e) => setEditLocation(e.target.value)} 
                required 
              />
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  marginBottom: '15px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white'
                }}
              >
                <option value="General">General</option>
                <option value="Seminar">Seminar</option>
                <option value="Workshop">Workshop</option>
                <option value="Sports">Sports</option>
                <option value="Social">Social</option>
                <option value="Academic">Academic</option>
              </select>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setEditImage(e.target.files[0])} 
              />
              <div className="modal-actions">
                <button type="submit" className="btn btn-success">Update Event</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;