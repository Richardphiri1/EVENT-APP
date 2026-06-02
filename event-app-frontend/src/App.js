import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import MyEvents from './pages/MyEvents';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

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
    const role = e.target.querySelector('input[name="role"]:checked').value;
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role })
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
          <h1>📅 <span>Event</span>Hub</h1>
          <div className="header-actions">
            <nav style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Link to="/" className="btn btn-primary">Home</Link>
              {user && (
                <>
                  <Link to="/my-events" className="btn btn-primary">My Events</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="btn btn-primary">Admin</Link>
                  )}
                </>
              )}
            </nav>
            {user ? (
              <>
                <span className="user-info">👋 {user.username} ({user.role})</span>
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
          <Route path="/my-events" element={<MyEvents />} />
          <Route path="/admin" element={<AdminDashboard />} />
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
                  <label><input type="radio" name="role" value="user" defaultChecked /> User</label>
                  <label><input type="radio" name="role" value="admin" /> Admin</label>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn btn-success">Register</button>
                  <button type="button" className="btn btn-outline" onClick={() => setShowRegister(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;