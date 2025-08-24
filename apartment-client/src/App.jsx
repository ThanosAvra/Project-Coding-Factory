import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NewApartment from './pages/NewApartment';
import MyBookings from './pages/MyBookings';
import Booking from './pages/Booking';


function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check for token changes periodically
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem('token');
      if (currentToken !== token) {
        setToken(currentToken);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <Router>
      {/* Navigation */}
      <nav style={{ padding: '1rem', background: '#f5f5f5', marginBottom: '1rem' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Αρχική</Link>
        {token && (
          <Link to="/my-bookings" style={{ marginRight: '1rem' }}>
            Οι Κρατήσεις Μου
          </Link>
        )}
        {token ? (
          <>
            <Link to="/new-apartment" style={{ marginRight: '1rem' }}>
              Νέο Διαμέρισμα
            </Link>
            <button onClick={handleLogout}>Αποσύνδεση</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ marginRight: '1rem' }}>Σύνδεση</Link>
            <Link to="/register">Εγγραφή</Link>
          </>
        )}
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/new-apartment" element={<NewApartment />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/booking/:id" element={<Booking />} />
      </Routes>
    </Router>
  );
}

export default App;
