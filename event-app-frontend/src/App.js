import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import MyEvents from './pages/MyEvents';
import AdminDashboard from './pages/AdminDashboard';
import CalendarView from './pages/CalendarView';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import Gallery from './pages/Gallery';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState('user');
  const [adminSecret, setAdminSecret] = useState('');

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setShowLogin(false);
        alert('Login successful!');
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      alert('Error logging in: ' + error.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          email, 
          password, 
          role: selectedRole,
          adminSecret: selectedRole === 'admin' ? adminSecret : undefined
        })
      });
      const data = await response.json();
      if (response.ok) {
        alert('Registration successful! Please login.');
        setShowRegister(false);
        setShowLogin(true);
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (error) {
      alert('Error registering: ' + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <div className="App">
        <header className="header">
          <h1>EventHub</h1>
          <div className="header-actions">
            <nav>
              <Link to="/" className="btn btn-primary">Home</Link>
              <Link to="/calendar" className="btn btn-primary">📅 Calendar</Link>
              <Link to="/gallery" className="btn btn-primary">🖼️ Gallery</Link>
              {user && user.role === 'user' && (
                <Link to="/my-events" className="btn btn-primary">My Events</Link>
              )}
              {user && user.role === 'admin' && (
                <>
                  <Link to="/admin" className="btn btn-primary">Admin</Link>
                  <Link to="/analytics" className="btn btn-primary">📊 Analytics</Link>
                </>
              )}
            </nav>
            {user ? (
              <>
                <span className="user-info">
                  👋 {user.username} <span className="role-badge">{user.role}</span>
                </span>
                <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <button className="btn btn-primary" onClick={() => { setShowLogin(true); setShowRegister(false); }}>Login</button>
                <button className="btn btn-success" onClick={() => { setShowRegister(true); setShowLogin(false); }}>Register</button>
              </>
            )}
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/my-events" element={<MyEvents />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
        </Routes>

        {showLogin && (
          <div className="modal-overlay" onClick={() => setShowLogin(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2>🔐 Login</h2>
              <form onSubmit={handleLogin}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary">Login</button>
                  <button type="button" className="btn btn-outline" onClick={() => setShowLogin(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showRegister && (
          <div className="modal-overlay" onClick={() => setShowRegister(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2>📝 Register</h2>
              <form onSubmit={handleRegister}>
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                
                <div className="radio-group">
                  <label>
                    <input 
                      type="radio" 
                      name="role" 
                      value="user" 
                      checked={selectedRole === 'user'} 
                      onChange={() => setSelectedRole('user')} 
                    /> User
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="role" 
                      value="admin" 
                      checked={selectedRole === 'admin'} 
                      onChange={() => setSelectedRole('admin')} 
                    /> Admin
                  </label>
                </div>

                {selectedRole === 'admin' && (
                  <input 
                    type="text" 
                    placeholder="Enter Admin Secret Key" 
                    value={adminSecret} 
                    onChange={(e) => setAdminSecret(e.target.value)} 
                    required 
                    style={{ marginTop: '10px' }}
                  />
                )}

                <div className="modal-actions">
                  <button type="submit" className="btn btn-success">Register</button>
                  <button type="button" className="btn btn-outline" onClick={() => setShowRegister(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <footer className="zuct-footer">
          <p>🏛️ <strong>Zambia University College of Technology</strong> — Event Management System</p>
          <p style={{ fontSize: '12px', marginTop: '5px' }}>© 2026 ZUCT | All rights reserved</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;