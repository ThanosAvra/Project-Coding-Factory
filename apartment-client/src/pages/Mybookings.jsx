import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { toast } from '../components/Toast';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get('/bookings/my');
      setBookings(res.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      toast.error('Σφάλμα κατά τη φόρτωση των κρατήσεων');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Είστε σίγουροι ότι θέλετε να ακυρώσετε αυτή την κράτηση;')) {
      return;
    }

    setCancellingId(bookingId);

    try {
      await axios.delete(`/bookings/${bookingId}`);
      // Refresh bookings list
      fetchBookings();
      toast.success('Η κράτηση ακυρώθηκε επιτυχώς');
    } catch (err) {
      console.error('Error canceling booking:', err);
      toast.error(err.response?.data?.error || 'Σφάλμα κατά την ακύρωση');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { color: 'var(--success-gradient)', text: '✅ Επιβεβαιωμένη', textColor: 'white' },
      cancelled: { color: 'var(--error-gradient)', text: '❌ Ακυρωμένη', textColor: 'white' },
      pending: { color: 'var(--warning-gradient)', text: '⏳ Εκκρεμής', textColor: 'white' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span style={{
        background: config.color,
        color: config.textColor,
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.875rem',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem'
      }}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '3rem' }}>
        <LoadingSpinner size="lg" />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
          Φόρτωση των κρατήσεών σας...
        </p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center" style={{ padding: '3rem' }}>
        <div style={{ 
          background: 'var(--primary-gradient)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '3rem 2rem',
          color: 'white',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
          <h2 style={{ margin: '0 0 1rem 0' }}>Δεν έχετε κρατήσεις</h2>
          <p style={{ margin: '0 0 2rem 0', opacity: 0.9 }}>
            Κάντε την πρώτη σας κράτηση για να τη δείτε εδώ!
          </p>
          <button 
            onClick={() => navigate('/')}
            className="btn"
            style={{ 
              background: 'white',
              color: 'var(--primary-color)',
              fontWeight: '600'
            }}
          >
            🏠 Περιήγηση Διαμερισμάτων
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="text-center mb-4">
        <h1 style={{ 
          background: 'var(--primary-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          📋 Οι Κρατήσεις μου
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Διαχειριστείτε τις κρατήσεις σας
        </p>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {bookings.map(booking => (
          <div key={booking._id} className="card">
            <div className="card-body">
              <div className="booking-card-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr auto', 
                gap: '1rem',
                alignItems: 'start'
              }}>
                <div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
                      {booking.apartment?.title || 'Διαμέρισμα'}
                    </h3>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <p style={{ 
                        margin: '0.25rem 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span>📍</span>
                        <strong>Τοποθεσία:</strong> {booking.apartment?.location}
                      </p>
                      
                      <p style={{ 
                        margin: '0.25rem 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span>📅</span>
                        <strong>Ημερομηνίες:</strong> 
                        {new Date(booking.startDate).toLocaleDateString('el-GR')} - 
                        {new Date(booking.endDate).toLocaleDateString('el-GR')}
                      </p>
                    </div>

                    <div>
                      <div style={{
                        background: 'var(--success-gradient)',
                        color: 'white',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--border-radius)',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Συνολικό Κόστος</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                          💰 {booking.totalPrice}€
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="booking-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {booking.status === 'confirmed' && (
                    <button 
                      onClick={() => handleCancelBooking(booking._id)}
                      className="btn btn-danger"
                      disabled={cancellingId === booking._id}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: '0.5rem',
                        minWidth: '150px'
                      }}
                    >
                      {cancellingId === booking._id ? (
                        <>
                          <LoadingSpinner size="sm" color="white" />
                          Ακύρωση...
                        </>
                      ) : (
                        <>
                          <span>🗑️</span>
                          Ακύρωση
                        </>
                      )}
                    </button>
                  )}
                  
                  <button 
                    onClick={() => navigate(`/booking/${booking.apartment?._id}`)}
                    className="btn btn-outline"
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      gap: '0.5rem',
                      minWidth: '150px'
                    }}
                  >
                    <span>👁️</span>
                    Προβολή
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}