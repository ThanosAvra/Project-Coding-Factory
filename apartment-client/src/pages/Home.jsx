import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { LoadingSpinner, SkeletonCard } from '../components/LoadingSpinner';
import { toast } from '../components/Toast';

export default function Home() {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/apartments')
      .then(res => {
        setApartments(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        toast.error('Σφάλμα κατά τη φόρτωση των διαμερισμάτων');
        setLoading(false);
      });
  }, []);

  const handleBooking = (apartmentId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.warning('Παρακαλώ συνδεθείτε πρώτα');
      navigate('/login');
      return;
    }
    navigate(`/booking/${apartmentId}`);
  };

  if (loading) {
    return (
      <div>
        <div className="text-center mb-5">
          <h1>Διαθέσιμα Διαμερίσματα</h1>
          <p>Ανακαλύψτε τα καλύτερα διαμερίσματα για τη διαμονή σας</p>
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '2rem'
        }}>
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-5">
        <h1 style={{ 
          background: 'var(--primary-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Διαθέσιμα Διαμερίσματα
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
          Ανακαλύψτε τα καλύτερα διαμερίσματα για τη διαμονή σας
        </p>
      </div>

      {apartments.length === 0 ? (
        <div className="text-center p-5">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏠</div>
          <h3>Δεν υπάρχουν διαθέσιμα διαμερίσματα</h3>
          <p>Ελέγξτε ξανά αργότερα ή προσθέστε το δικό σας διαμέρισμα!</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '2rem'
        }}>
          {apartments.map(apartment => (
            <div key={apartment._id} className="card">
              <div className="card-body">
                <h3 style={{ 
                  margin: '0 0 1rem 0', 
                  color: 'var(--text-primary)',
                  fontSize: '1.25rem'
                }}>
                  {apartment.title}
                </h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ 
                    margin: '0.5rem 0', 
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span>📍</span> {apartment.location}
                  </p>
                  
                  <div style={{
                    background: 'var(--success-gradient)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--border-radius)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '1.1rem',
                    fontWeight: '600'
                  }}>
                    <span>💰</span> {apartment.pricePerNight}€ / βραδιά
                  </div>
                </div>

                <button
                  onClick={() => handleBooking(apartment._id)}
                  className="btn btn-primary w-full"
                  style={{ marginTop: '1rem' }}
                >
                  <span style={{ marginRight: '0.5rem' }}>📅</span>
                  Κράτηση
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}