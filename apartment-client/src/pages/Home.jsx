import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

export default function Home() {
  const [apartments, setApartments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/apartments').then(res => setApartments(res.data));
  }, []);

  const handleBooking = (apartmentId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Παρακαλώ συνδεθείτε για να κάνετε κράτηση');
      navigate('/login');
      return;
    }
    navigate(`/booking/${apartmentId}`);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Διαθέσιμα Διαμερίσματα</h2>
      {apartments.length === 0 ? (
        <p>Δεν υπάρχουν διαθέσιμα διαμερίσματα. Δημιουργήστε ένα νέο!</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          {apartments.map(apartment => (
            <div key={apartment._id} style={{ 
              border: '1px solid #ddd', 
              padding: '1rem', 
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
                {apartment.title}
              </h3>
              <p style={{ margin: '0.25rem 0', color: '#666' }}>
                📍 {apartment.location}
              </p>
              <p style={{ margin: '0.25rem 0', fontWeight: 'bold', color: '#2c5aa0' }}>
                💰 {apartment.pricePerNight}€ / βραδιά
              </p>
              <button 
                onClick={() => handleBooking(apartment._id)}
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                Κάντε Κράτηση
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}