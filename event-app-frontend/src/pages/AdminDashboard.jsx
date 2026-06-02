import React, { useState } from 'react';

function AdminDashboard() {
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventImage, setEventImage] = useState(null);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', eventTitle);
      formData.append('description', eventDescription);
      formData.append('date', eventDate);
      formData.append('time', eventTime);
      formData.append('location', eventLocation);
      if (eventImage) {
        formData.append('eventImage', eventImage);
      }

      const response = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await response.json();
      if (response.ok) {
        alert('Event created successfully!');
        setShowEventForm(false);
        resetForm();
        window.location.reload();
      } else {
        alert(data.error || 'Failed to create event');
      }
    } catch (error) {
      alert('Error creating event: ' + error.message);
    }
  };

  const resetForm = () => {
    setEventTitle('');
    setEventDescription('');
    setEventDate('');
    setEventTime('');
    setEventLocation('');
    setEventImage(null);
  };

  return (
    <div className="events-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>⚙️ Admin Dashboard</h2>
        <button 
          className="btn btn-success"
          onClick={() => setShowEventForm(!showEventForm)}
        >
          {showEventForm ? '✖️ Close Form' : '➕ Create Event'}
        </button>
      </div>

      {showEventForm && (
        <div className="modal" style={{ maxWidth: '600px', margin: '0 auto 30px auto' }}>
          <h3>Create New Event</h3>
          <form onSubmit={handleCreateEvent}>
            <input 
              type="text" 
              placeholder="Event Title" 
              value={eventTitle} 
              onChange={(e) => setEventTitle(e.target.value)} 
              required 
            />
            <textarea 
              placeholder="Description" 
              value={eventDescription} 
              onChange={(e) => setEventDescription(e.target.value)} 
              required 
            />
            <input 
              type="date" 
              value={eventDate} 
              onChange={(e) => setEventDate(e.target.value)} 
              required 
            />
            <input 
              type="time" 
              value={eventTime} 
              onChange={(e) => setEventTime(e.target.value)} 
              required 
            />
            <input 
              type="text" 
              placeholder="Location" 
              value={eventLocation} 
              onChange={(e) => setEventLocation(e.target.value)} 
              required 
            />
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setEventImage(e.target.files[0])} 
            />
            <div className="modal-actions">
              <button type="submit" className="btn btn-success">Create Event</button>
              <button type="button" className="btn btn-outline" onClick={() => { setShowEventForm(false); resetForm(); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ textAlign: 'center', padding: '30px', background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h3>Manage Events</h3>
        <p>Use the form above to create new events.</p>
        <p>To edit or delete events, go to the <strong>Home</strong> page.</p>
      </div>
    </div>
  );
}

export default AdminDashboard;