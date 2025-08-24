import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';

export default function Booking() {
  const { id } = useParams();
  const [apartment, setApartment] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch apartment details
    axios.get(`/apartments/${id}`)
      .then(res => setApartment(res.data))
      .catch(err => console.error('Error fetching apartment:', err));
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

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      alert('Παρακαλώ επιλέξτε ημερομηνίες');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      alert('Η ημερομηνία λήξης πρέπει να είναι μετά την ημερομηνία έναρξης');
      return;
    }

    try {
      await axios.post('/bookings', { 
        apartmentId: id, 
        startDate, 
        endDate,
        totalPrice 
      });
      alert('Κράτηση επιτυχής!');
      navigate('/my-bookings');
    } catch (err) {
      alert(err.response?.data?.error || 'Σφάλμα στην κράτηση');
    }
  };

  if (!apartment) {
    return <div style={{ padding: '1rem' }}>Φόρτωση...</div>;
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '600px' }}>
      <h2>Κράτηση Διαμερίσματος</h2>
      
      <div style={{ 
        border: '1px solid #ddd', 
        padding: '1rem', 
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        marginBottom: '1rem'
      }}>
        <h3>{apartment.title}</h3>
        <p> {apartment.location}</p>
        <p><strong> {apartment.pricePerNight}€ / βραδιά</strong></p>
      </div>

      <form onSubmit={handleBooking}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Ημερομηνία Έναρξης:
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
            style={{ padding: '0.5rem', width: '200px' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Ημερομηνία Λήξης:
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || new Date().toISOString().split('T')[0]}
            required
            style={{ padding: '0.5rem', width: '200px' }}
          />
        </div>

        {totalPrice > 0 && (
          <div style={{ 
            backgroundColor: '#e8f5e8', 
            padding: '1rem', 
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            <strong>Συνολικό Κόστος: {totalPrice}€</strong>
          </div>
        )}

        <button 
          type="submit"
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Επιβεβαίωση Κράτησης
        </button>
      </form>
    </div>
  );
}