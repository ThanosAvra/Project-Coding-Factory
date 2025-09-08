import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../api/axios';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { toast } from '../components/Toast';
import { format, isAfter, isBefore } from 'date-fns';
import { useUser } from '../context/UserContext';

// Set the default locale for date-fns
import styled from 'styled-components';

const BookingCard = styled.div`
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin-bottom: 1rem;
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  }
`;

// Status configuration
const STATUS_CONFIG = {
  PENDING: {
    text: '⏳ Εκκρεμεί',
    className: 'bg-warning text-dark',
    icon: '⏳',
    color: 'var(--warning)'
  },
  CONFIRMED: {
    text: '✅ Επιβεβαιωμένη',
    className: 'bg-success text-white',
    icon: '✓',
    color: 'var(--success)'
  },
  CANCELLED: {
    text: '❌ Ακυρώθηκε',
    className: 'bg-danger text-white',
    icon: '✕',
    color: 'var(--danger)'
  }
};

// Status order for grouping
const STATUS_ORDER = [
  'CONFIRMED',
  'PENDING',
  'CANCELLED'
];

// Helper function to format dates consistently
const formatDate = (dateString) => {
  try {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState('');
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check for successful booking confirmation from navigation state
  useEffect(() => {
    if (location.state?.bookingConfirmed) {
      toast.success('Η κράτησή σας επιβεβαιώθηκε με επιτυχία!');
      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const res = await axios.get('/bookings/my');
        // Sort bookings by date (newest first) and status
        const sortedBookings = res.data.sort((a, b) => {
          // First sort by status (using STATUS_ORDER)
          const statusOrderA = STATUS_ORDER.indexOf(a.status || 'PENDING');
          const statusOrderB = STATUS_ORDER.indexOf(b.status || 'PENDING');
          
          if (statusOrderA !== statusOrderB) {
            return statusOrderA - statusOrderB;
          }
          
          // Then sort by start date (newest first)
          return new Date(b.startDate) - new Date(a.startDate);
        });
        
        setBookings(sortedBookings);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Σφάλμα φόρτωσης κρατήσεων');
        toast.error('Δεν ήταν δυνατή η φόρτωση των κρατήσεων');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Είστε σίγουροι ότι θέλετε να ακυρώσετε αυτή την κράτηση;')) {
      return;
    }

    setCancellingId(bookingId);
    
    try {
      await axios.patch(`/bookings/${bookingId}`, { status: 'CANCELLED' });
      
      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: 'CANCELLED' } 
            : booking
        )
      );
      
      toast.success('Η κράτηση ακυρώθηκε επιτυχώς');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      const errorMessage = error.response?.data?.message || 'Σφάλμα κατά την ακύρωση';
      toast.error(errorMessage);
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { text: 'Εκκρεμεί', class: 'status-pending' },
      CONFIRMED: { text: 'Επιβεβαιωμένη', class: 'status-confirmed' },
      CANCELLED: { text: 'Ακυρωμένη', class: 'status-cancelled' }
    };
    
    const statusInfo = statusMap[status] || { text: status, class: 'status-unknown' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  if (!user) {
    return (
      <div className="auth-required">
        <h2>Απαιτείται σύνδεση</h2>
        <p>Παρακαλώ συνδεθείτε για να δείτε τις κρατήσεις σας.</p>
        <button 
          onClick={() => navigate('/login', { state: { from: '/my-bookings' } })}
          className="btn btn-primary"
        >
          Σύνδεση
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <LoadingSpinner />
        <p className="mt-3">Φόρτωση κρατήσεων...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="card">
          <div className="card-body py-5">
            <h2>Δεν βρέθηκαν κρατήσεις</h2>
            <p className="text-muted mt-3">
              Δεν έχετε κάνει ακόμα κρατήσεις. Ξεκινήστε τώρα!
            </p>
            <button 
              className="btn btn-primary mt-3"
              onClick={() => navigate('/')}
            >
              🔍 Βρείτε Διαμέρισμα
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderBookingCard = (booking) => {
    const status = booking.status || 'PENDING';
    const statusInfo = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);
    const now = new Date();
    
    // Fix date comparisons
    const isUpcoming = isAfter(startDate, now);
    const isActive = isBefore(now, endDate) && isAfter(now, startDate);
    const isPast = isAfter(now, endDate);

    return (
      <BookingCard key={booking._id} className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start">
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <h5 className="card-title mb-1">
                    {booking.apartment?.title || 'Δεν βρέθηκε διαμέρισμα'}
                  </h5>
                </div>
                <div className="d-flex align-items-center gap-5 ms-auto">
                  {(status === 'PENDING' || status === 'CONFIRMED') && isUpcoming && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="btn btn-outline-danger"
                      style={{
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontWeight: '500',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s ease',
                        border: '1.5px solid #dc3545'
                      }}
                      disabled={cancellingId === booking._id}
                      onMouseOver={(e) => {
                        if (!cancellingId) {
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
                        }
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      {cancellingId === booking._id ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Ακύρωση...
                        </>
                      ) : (
                        <>
                          <span className="me-2">✕</span>
                          Ακύρωση
                        </>
                      )}
                    </button>
                  )}
                  <button 
                    onClick={() => navigate(`/apartments/${booking.apartment?._id}`)}
                    className="btn btn-primary"
                    style={{
                      background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 20px',
                      fontWeight: '500',
                      fontSize: '0.9rem',
                      boxShadow: '0 2px 8px rgba(0, 123, 255, 0.2)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(0, 123, 255, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 8px rgba(0, 123, 255, 0.2)';
                    }}
                  >
                    <span className="me-2">👁️</span>
                    Προβολή
                  </button>
                </div>
              </div>
              <p className="text-muted small mb-2">
                <span className="me-2">📅</span>
                {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
              </p>
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span 
                  className={`badge ${statusInfo.className} d-flex align-items-center gap-1`}
                  style={{
                    padding: '0.35em 0.65em',
                    fontSize: '0.85em',
                    fontWeight: 600
                  }}
                >
                  <span>{statusInfo.icon}</span>
                  <span>{statusInfo.text}</span>
                </span>
                {isActive && (
                  <span 
                    className="badge d-flex align-items-center gap-1"
                    style={{
                      background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                      color: 'white',
                      padding: '0.35em 0.65em',
                      fontSize: '0.85em',
                      fontWeight: 600
                    }}
                  >
                    <span>🔴</span> Σε εξέλιξη
                  </span>
                )}
                {isUpcoming && (
                  <span 
                    className="badge d-flex align-items-center gap-1"
                    style={{
                      background: 'linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%)',
                      color: 'white',
                      padding: '0.35em 0.65em',
                      fontSize: '0.85em',
                      fontWeight: 600
                    }}
                  >
                    <span>⏳</span> Προσεχώς
                  </span>
                )}
                {isPast && (
                  <span 
                    className="badge d-flex align-items-center gap-1"
                    style={{
                      background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                      color: 'white',
                      padding: '0.35em 0.65em',
                      fontSize: '0.85em',
                      fontWeight: 600
                    }}
                  >
                    <span>✅</span> Ολοκληρώθηκε
                  </span>
                )}
              </div>
              <div className="d-flex justify-content-between align-items-center mt-2">
                <div>
                  <p className="mb-1">
                    <strong>Σύνολο:</strong> {booking.totalPrice?.toFixed(2)}€
                  </p>
                  <p className="text-muted small mb-0">
                    Κωδικός: {booking._id.substring(18).toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BookingCard>
    );
  };

  // Group bookings by status
  const groupedBookings = bookings.reduce((acc, booking) => {
    const status = booking.status || 'PENDING';
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(booking);
    return acc;
  }, {});

  // Sort bookings within each status group by date (newest first)
  Object.values(groupedBookings).forEach(group => {
    group.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  });

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          <span className="gradient-text">Οι Κρατήσεις μου</span>
        </h1>
        <button 
          className="btn btn-success"
          onClick={() => navigate('/')}
          style={{
            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 24px',
            fontWeight: '600',
            fontSize: '1rem',
            boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-3px)';
            e.target.style.boxShadow = '0 8px 25px rgba(40, 167, 69, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)';
          }}
        >
          <span>🔍</span>
          Νέα Κράτηση
        </button>
      </div>

      {STATUS_ORDER.map(status => {
        const bookingsInStatus = groupedBookings[status] || [];
        if (bookingsInStatus.length === 0) return null;

        const statusInfo = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
        
        return (
          <div key={status} className="mb-4">
            <h5 className="d-flex align-items-center gap-2 mb-3">
              <span className={`badge ${statusInfo.className} d-flex align-items-center`}>
                {statusInfo.icon} {statusInfo.text}
              </span>
              <span className="text-muted">({bookingsInStatus.length})</span>
            </h5>
            
            <div className="row g-3">
              {bookingsInStatus.map(booking => (
                <div key={booking._id} className="col-12">
                  {renderBookingCard(booking)}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}