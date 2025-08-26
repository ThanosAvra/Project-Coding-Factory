import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import CreateApartment from './pages/CreateApartment';
import Payment from './pages/Payment';
import { ToastContainer } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(null);

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
      <nav className="navbar">
        <div className="container">
          <div className="d-flex justify-between align-center">
            <div className="d-flex align-center" style={{ gap: '1rem' }}>
              <Link to="/" className="nav-link" style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                🏠 ApartmentBooking
              </Link>
            </div>
            
            <div className="d-flex align-center" style={{ gap: '0.5rem' }}>
              <Link to="/" className="nav-link">Αρχική</Link>
              {token ? (
                <>
                  <Link to="/create-apartment" className="btn btn-success btn-sm">+ Νέο Διαμέρισμα</Link>
                  <Link to="/my-bookings" className="btn btn-outline btn-sm">Οι Κρατήσεις μου</Link>
                  <button onClick={handleLogout} className="btn btn-danger btn-sm">Αποσύνδεση</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-outline btn-sm">Σύνδεση</Link>
                  <Link to="/register" className="btn btn-primary btn-sm">Εγγραφή</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="container">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/booking/:id" element={<Booking />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/create-apartment" element={<CreateApartment />} />
              <Route path="/payment" element={<Payment />} />
            </Routes>
          </ErrorBoundary>
        </div>
      </main>

      {/* Toast Notifications */}
      <ToastContainer />
    </Router>
  );
}

export default App;
