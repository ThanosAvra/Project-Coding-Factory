import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import axios from './api/axios';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import CreateApartment from './pages/CreateApartment';
import EditApartment from './pages/EditApartment';
import ManageAvailability from './pages/ManageAvailability';
import MyApartments from './pages/MyApartments';
import Payment from './pages/Payment';
import ApartmentDetails from './pages/ApartmentDetails';
import CreateAdmin from './pages/CreateAdmin';
import { ToastContainer } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import { UserProvider, useUser } from './context/UserContext';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminBlockedDates from './pages/AdminBlockedDates';
import NotFound from './pages/NotFound';

function Navigation() {
  const { user, logout } = useUser();
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
            <Link to="/" className="nav-link">
              Αρχική
            </Link>
            {user && (
              <Link to="/my-bookings" className="nav-link">
                Οι Κρατήσεις μου
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link to="/create-apartment" className="nav-link">
                Δημιουργία Διαμερίσματος
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="nav-link">
                Πίνακας Ελέγχου
              </Link>
            )}
          </div>
          <div className="d-flex align-center" style={{ gap: '1rem' }}>
            {user ? (
              <>
                <span className="nav-text">
                  Καλώς ήρθατε, {user.name}
                  {user.role === 'ADMIN' && ' (Διαχειριστής)'}
                </span>
                <button onClick={handleLogout} className="btn btn-outline">
                  Αποσύνδεση
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline">
                  Σύνδεση
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Εγγραφή
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  const { setUser } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('/users/me');
        setUser(response.data);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [setUser]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

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
              <Route path="/create-admin" element={<CreateAdmin />} />
              
              {/* Apartment Details Route */}
              <Route path="/apartments/:id" element={<ApartmentDetails />} />
              <Route path="/apartment/:id" element={<ApartmentDetails />} />
              
              {/* Apartment Edit Route */}
              <Route
                path="/apartment/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditApartment />
                  </ProtectedRoute>
                }
              />
              
              {/* Protected Routes */}
              <Route
                path="/booking/:id"
                element={
                  <ProtectedRoute>
                    <Booking />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />
              
              {/* Admin Only Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/blocked-dates"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminBlockedDates />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/create-apartment"
                element={
                  <ProtectedRoute requireAdmin>
                    <CreateApartment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-apartments"
                element={
                  <ProtectedRoute>
                    <MyApartments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manage-availability/:apartmentId"
                element={
                  <ProtectedRoute>
                    <ManageAvailability />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />
              <Route path="/payment" element={<Payment />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </ErrorBoundary>
        </div>
      </main>
      <ToastContainer />
    </Router>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
