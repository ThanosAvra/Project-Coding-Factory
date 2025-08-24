import { useEffect, useState } from 'react';
import axios from '../api/axios';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/bookings')
      .then(res => {
        setBookings(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Είστε σίγουροι ότι θέλετε να ακυρώσετε αυτή την κράτηση;')) {
      try {
        await axios.delete(`/bookings/${bookingId}`);
        setBookings(bookings.filter(b => b._id !== bookingId));
        alert('Η κράτηση ακυρώθηκε επιτυχώς');
      } catch (err) {
        alert('Σφάλμα κατά την ακύρωση της κράτησης');
      }
    }
  };

  if (loading) {
    return <div style={{ padding: '1rem' }}>Φόρτωση κρατήσεων...</div>;
  }

  return (
    <div style={{ 
      padding: '1rem', 
      maxWidth: '800px', 
      margin: '0 auto',
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Οι Κρατήσεις Μου</h2>
      {bookings.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem 2rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          color: 'white',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏠</div>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: '600' }}>
            Δεν έχεις κάνει ακόμη καμία κράτηση
          </h3>
          <p style={{ margin: '0 0 2rem 0', opacity: 0.9, fontSize: '1.1rem' }}>
            Ανακάλυψε υπέροχα διαμερίσματα και κάνε την πρώτη σου κράτηση!
          </p>
          <a 
            href="/" 
            style={{ 
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '25px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            🔍 Περιήγηση Διαμερισμάτων
          </a>
        </div>
      ) : (
        <div style={{ width: '100%' }}>
          {bookings.map(booking => (
            <div key={booking._id} style={{ 
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              backgroundColor: '#fff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>
                    {booking.apartment?.title || 'Διαμέρισμα'}
                  </h3>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}>
                    📍 {booking.apartment?.location}
                  </p>
                  <p style={{ margin: '0.25rem 0' }}>
                    <strong>Ημερομηνίες:</strong> {' '}
                    {new Date(booking.startDate).toLocaleDateString('el-GR')} - {' '}
                    {new Date(booking.endDate).toLocaleDateString('el-GR')}
                  </p>
                  {booking.totalPrice && (
                    <p style={{ margin: '0.25rem 0' }}>
                      <strong>Συνολικό κόστος:</strong> {booking.totalPrice}€
                    </p>
                  )}
                  <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#888' }}>
                    Κράτηση: {new Date(booking.createdAt || booking._id.substring(0, 8) * 1000).toLocaleDateString('el-GR')}
                  </p>
                </div>
                <button
                  onClick={() => handleCancelBooking(booking._id)}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Ακύρωση
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}