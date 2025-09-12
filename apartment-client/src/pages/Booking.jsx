import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { toast } from '../components/Toast';
import { useUser } from '../context/UserContext';
import LoadingSpinner from '../components/LoadingSpinner';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/DatePicker.css';

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState([]);

  useEffect(() => {
    const fetchApartment = async () => {
      try {
        const response = await axios.get(`/apartments/${id}`);
        setApartment(response.data);
        setError(null);
        
        // Fetch unavailable dates
        await fetchUnavailableDates(id);
      } catch (err) {
        console.error('Error fetching apartment:', err);
        setError('Δεν ήταν δυνατή η φόρτωση του διαμερίσματος');
        toast.error('Σφάλμα φόρτωσης διαμερίσματος');
      } finally {
        setLoading(false);
      }
    };

    fetchApartment();
  }, [id]);

  const fetchUnavailableDates = async (apartmentId) => {
    try {
      // Χρήση του νέου API endpoint για λήψη μη διαθέσιμων ημερομηνιών
      const response = await axios.get(`/apartments/${apartmentId}/unavailable-dates`);
      const unavailableDateStrings = response.data.unavailableDates;
      
      // Μετατροπή των string ημερομηνιών σε Date objects
      const unavailableDateObjects = unavailableDateStrings.map(dateStr => new Date(dateStr));
      
      setUnavailableDates(unavailableDateObjects);
    } catch (error) {
      console.error('Σφάλμα φόρτωσης μη διαθέσιμων ημερομηνιών:', error);
      // Σε περίπτωση σφάλματος, κρατάμε κενό array
      setUnavailableDates([]);
    }
  };

  useEffect(() => {
    if (startDate && endDate && apartment) {
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setTotalPrice(diffDays * apartment.pricePerNight);
      
      // Check availability when dates are selected
      checkAvailability();
    } else {
      setTotalPrice(0);
    }
  }, [startDate, endDate, apartment]);

  const checkAvailability = async () => {
    if (!startDate || !endDate || !apartment) return true;

    try {
      const response = await axios.get(`/availability/check/${apartment._id}`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });

      if (!response.data.available) {
        toast.error('Οι επιλεγμένες ημερομηνίες δεν είναι διαθέσιμες για κράτηση');
        return false;
      }
      return true;
    } catch (error) {
      toast.error('Σφάλμα κατά τον έλεγχο διαθεσιμότητας');
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.warning('Παρακαλώ συνδεθείτε πρώτα');
      navigate('/login', { state: { from: `/booking/${id}` } });
      return;
    }

    if (!startDate || !endDate) {
      toast.warning('Παρακαλώ επιλέξτε ημερομηνίες κράτησης');
      return;
    }

    // Check availability before proceeding
    const isAvailable = await checkAvailability();
    if (!isAvailable) {
      return; // Error message already shown in checkAvailability
    }

    setSubmitting(true);

    try {
      const bookingData = {
        apartmentId: id,
        apartmentTitle: apartment.title,
        apartmentLocation: apartment.location,
        startDate,
        endDate,
        totalPrice
      };

      // Persist booking details in case of page refresh or direct access to /payment
      try {
        sessionStorage.setItem('bookingInfo', JSON.stringify(bookingData));
      } catch (_) {}

      navigate('/payment', { state: { bookingInfo: bookingData } });
    } catch (error) {
      console.error('Booking error:', error);
      const errorMessage = error.response?.data?.message || 'Σφάλμα κατά την κράτηση';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
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

  if (error) {
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
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  minDate={new Date()}
                  excludeDates={unavailableDates}
                  filterDate={(date) => {
                    const isExcluded = unavailableDates.some(excludedDate => 
                      excludedDate.toDateString() === date.toDateString()
                    );
                    return !isExcluded;
                  }}
                  dayClassName={(date) => {
                    const isUnavailable = unavailableDates.some(unavailableDate => 
                      unavailableDate.toDateString() === date.toDateString()
                    );
                    return isUnavailable ? 'react-datepicker__day--unavailable' : '';
                  }}
                  placeholderText="Επιλέξτε ημερομηνία άφιξης"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">📅 Ημερομηνία Λήξης:</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate || new Date()}
                  excludeDates={unavailableDates}
                  filterDate={(date) => {
                    const isExcluded = unavailableDates.some(excludedDate => 
                      excludedDate.toDateString() === date.toDateString()
                    );
                    return !isExcluded;
                  }}
                  dayClassName={(date) => {
                    const isUnavailable = unavailableDates.some(unavailableDate => 
                      unavailableDate.toDateString() === date.toDateString()
                    );
                    return isUnavailable ? 'react-datepicker__day--unavailable' : '';
                  }}
                  placeholderText="Επιλέξτε ημερομηνία αναχώρησης"
                  className="form-input"
                  required
                />
              </div>

              {/* Legend για τα χρώματα του ημερολογίου */}
              <div className="datepicker-legend">
                <div className="legend-item">
                  <div className="legend-color legend-available"></div>
                  <span>✅ Διαθέσιμες ημερομηνίες</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color legend-unavailable"></div>
                  <span>❌ Μη διαθέσιμες ημερομηνίες</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color legend-selected"></div>
                  <span>📅 Επιλεγμένες ημερομηνίες</span>
                </div>
              </div>

              {totalPrice > 0 && (
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
                    <strong>{Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))} βραδιές</strong> × <strong>{apartment.pricePerNight}€</strong>
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '700' }}>
                    Συνολικό Κόστος: {totalPrice}€
                  </div>
                </div>
              )}

              <button 
                type="submit"
                className="btn btn-success w-full"
                disabled={!startDate || !endDate || submitting}
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

export default Booking;