import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

export default function NewApartment() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [pricePerNight, setPricePerNight] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/apartments', {
        title,
        location,
        pricePerNight: Number(pricePerNight)
      });
      alert('Διαμέρισμα δημιουργήθηκε!');
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.error || 'Σφάλμα δημιουργίας');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Νέο Διαμέρισμα</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Τίτλος"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ display: 'block', margin: '0.5rem 0' }}
        />
        <input
          placeholder="Τοποθεσία"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
          style={{ display: 'block', margin: '0.5rem 0' }}
        />
        <input
          type="number"
          placeholder="Τιμή ανά βραδιά (€)"
          value={pricePerNight}
          onChange={(e) => setPricePerNight(e.target.value)}
          required
          min="0"
          style={{ display: 'block', margin: '0.5rem 0' }}
        />
        <button type="submit">Αποθήκευση</button>
      </form>
    </div>
  );
}