import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function CalendarView() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [eventsOnDate, setEventsOnDate] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    // Filter events for the selected date
    const filtered = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === selectedDate.toDateString();
    });
    setEventsOnDate(filtered);
  }, [selectedDate, events]);

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

  // Highlight dates with events on the calendar
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const hasEvent = events.some(event => 
        new Date(event.date).toDateString() === date.toDateString()
      );
      return hasEvent ? (
        <div style={{
          width: '6px',
          height: '6px',
          backgroundColor: '#c8a84e',
          borderRadius: '50%',
          margin: '2px auto 0'
        }} />
      ) : null;
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="events-container">
      <div style={{ 
        display: 'flex', 
        gap: '40px', 
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <div style={{ flex: 1, minWidth: '300px', maxWidth: '500px' }}>
          <h2 style={{ marginBottom: '20px' }}>📅 Event Calendar</h2>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '20px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)'
          }}>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileContent={tileContent}
              className="custom-calendar"
              style={{
                background: 'transparent',
                color: 'white'
              }}
            />
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }}>
          <h2 style={{ marginBottom: '20px' }}>
            Events on {selectedDate.toLocaleDateString()}
          </h2>
          {eventsOnDate.length === 0 ? (
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '16px',
              padding: '40px',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>
                No events on this date
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {eventsOnDate.map(event => (
                <div key={event.id} style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  transition: 'all 0.3s ease'
                }}>
                  <h3 style={{ color: '#c8a84e', marginBottom: '4px' }}>{event.title}</h3>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>🕐 {event.time}</span>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>📍 {event.location}</span>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: '1.5' }}>
                    {event.description}
                  </p>
                  <div style={{ marginTop: '12px' }}>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                      👥 {event.attendees || 0} attendees
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Custom CSS for the calendar
const calendarStyles = `
  .custom-calendar .react-calendar {
    background: transparent;
    border: none;
    font-family: 'Inter', sans-serif;
    width: 100%;
  }
  .custom-calendar .react-calendar__navigation {
    margin-bottom: 12px;
  }
  .custom-calendar .react-calendar__navigation button {
    color: white;
    font-size: 16px;
    font-weight: 600;
    background: transparent;
    border: none;
    padding: 8px 12px;
    border-radius: 8px;
    transition: all 0.2s ease;
  }
  .custom-calendar .react-calendar__navigation button:hover {
    background: rgba(255,255,255,0.05);
  }
  .custom-calendar .react-calendar__month-view__weekdays {
    color: rgba(255,255,255,0.5);
    font-weight: 500;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .custom-calendar .react-calendar__month-view__weekdays__weekday {
    padding: 8px 0;
  }
  .custom-calendar .react-calendar__month-view__days__day {
    color: rgba(255,255,255,0.8);
    font-size: 14px;
    padding: 12px;
    border-radius: 50%;
    transition: all 0.2s ease;
  }
  .custom-calendar .react-calendar__month-view__days__day:hover {
    background: rgba(255,255,255,0.05);
  }
  .custom-calendar .react-calendar__month-view__days__day--neighboringMonth {
    color: rgba(255,255,255,0.2);
  }
  .custom-calendar .react-calendar__month-view__days__day--active {
    background: #1a3c6e;
    color: white;
  }
  .custom-calendar .react-calendar__month-view__days__day--selected {
    background: #c8a84e;
    color: #0a1628;
    font-weight: 700;
  }
  .custom-calendar .react-calendar__tile {
    background: transparent;
  }
`;

// Inject custom CSS
const styleSheet = document.createElement("style");
styleSheet.textContent = calendarStyles;
document.head.appendChild(styleSheet);

export default CalendarView;