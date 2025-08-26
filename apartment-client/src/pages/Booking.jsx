import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { toast } from '../components/Toast';

export default function Booking() {
  const { id } = useParams();
  const [apartment, setApartment] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch apartment details
    axios.get(`/apartments/${id}`)
      .then(res => {
        setApartment(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching apartment:', err);
        toast.error('Σφάλμα κατά τη φόρτωση του διαμερίσματος');
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (startDate && endDate && apartment) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (days > 0) {
        setTotalPrice(days * apartment.pricePerNight);
      }
    }
  }, [startDate, endDate, apartment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      toast.warning('Παρακαλώ επιλέξτε ημερομηνίες');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast.error('Η ημερομηνία αναχώρησης πρέπει να είναι μετά την άφιξη');
      return;
    }

    // Navigate to payment page with booking info
    const bookingInfo = {
      apartmentId: id,
      apartmentTitle: apartment.title,
      apartmentLocation: apartment.location,
      startDate,
      endDate,
      totalPrice
    };

    // Persist booking details in case of page refresh or direct access to /payment
    try {
      sessionStorage.setItem('bookingInfo', JSON.stringify(bookingInfo));
    } catch (_) {}

    navigate('/payment', { state: { bookingInfo } });
  };

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '3rem' }}>
        <LoadingSpinner size="lg" />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
          Φόρτωση στοιχείων διαμερίσματος...
        </p>
      </div>
    );
  }

  if (!apartment) {
    return (
      <div className="text-center" style={{ padding: '3rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
        <h3>Το διαμέρισμα δεν βρέθηκε</h3>
        <p>Το διαμέρισμα που ψάχνετε δεν υπάρχει ή έχει αφαιρεθεί.</p>
        <button 
          onClick={() => navigate('/')} 
          className="btn btn-primary"
          style={{ marginTop: '1rem' }}
        >
          Επιστροφή στην Αρχική
        </button>
      </div>
    );
  }

  const days = startDate && endDate ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="text-center mb-4">
        <h1 style={{ 
          background: 'var(--primary-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          📅 Κράτηση Διαμερίσματος
        </h1>
      </div>

      <div className="booking-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Apartment Details */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0 }}>Στοιχεία Διαμερίσματος</h3>
          </div>
          <div className="card-body">
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
              {apartment.title}
            </h4>
            
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                margin: '0.5rem 0'
              }}>
                <span>📍</span> 
                <strong>Τοποθεσία:</strong> {apartment.location}
              </p>
              
              <div style={{
                background: 'var(--success-gradient)',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--border-radius)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1.2rem',
                fontWeight: '600'
              }}>
                <span>💰</span> {apartment.pricePerNight}€ / βραδιά
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0 }}>Επιλογή Ημερομηνιών</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">📅 Ημερομηνία Έναρξης:</label>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label className="form-label">📅 Ημερομηνία Λήξης:</label>
                <input
                  type="date"
                  className="form-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  required
                  disabled={submitting}
                />
              </div>

              {days > 0 && (
                <div style={{ 
                  background: 'var(--warning-gradient)',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: 'var(--border-radius)',
                  marginBottom: '1.5rem',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                    📊 Σύνοψη Κράτησης
                  </div>
                  <div style={{ margin: '0.5rem 0' }}>
                    <strong>{days} βραδιές</strong> × <strong>{apartment.pricePerNight}€</strong>
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '700' }}>
                    Συνολικό Κόστος: {totalPrice}€
                  </div>
                </div>
              )}

              <button 
                type="submit"
                className="btn btn-success w-full"
                disabled={submitting || !totalPrice}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    Επεξεργασία...
                  </>
                ) : (
                  <>
                    <span>✅</span>
                    Επιβεβαίωση Κράτησης
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}