import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import CreateApartment from './pages/CreateApartment';
import Payment from './pages/Payment';
import { ToastContainer } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthContext } from './context/AuthContext.jsx';

function Navigation() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="d-flex justify-between align-center">
          <div className="d-flex align-center" style={{ gap: '1rem' }}>
            <Link to="/" className="nav-link" style={{ fontSize: '1.25rem', fontWeight: '700' }}>
              🏠 ApartmentBooking
            </Link>
          </div>
          
          <div className="d-flex align-center" style={{ gap: '1rem' }}>
            <Link to="/" className="nav-link">Αρχική</Link>
            {user ? (
              <>
                <div className="nav-user" style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--border-radius-sm)',
                  background: 'rgba(255, 255, 255, 0.1)'
                }}>
                  <span className="user-avatar" style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--primary-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                  }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                  <span className="user-name" style={{
                    fontWeight: 600,
                    color: 'var(--text-white)',
                    fontSize: '0.9375rem'
                  }}>
                    {user.name || 'Χρήστης'}
                  </span>
                </div>
                <Link to="/my-bookings" className="nav-link">Οι Κρατήσεις μου</Link>
                {user.role === 'ADMIN' && (
                  <Link to="/create-apartment" className="nav-link">Δημιουργία Διαμερίσματος</Link>
                )}
                <button 
                  onClick={handleLogout} 
                  className="btn btn-link nav-link"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>Αποσύνδεση</span>
                  <span>🚪</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Σύνδεση</Link>
                <Link to="/register" className="nav-link">Εγγραφή</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Navigation />
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
      <ToastContainer />
    </Router>
  );
}

export default App;
