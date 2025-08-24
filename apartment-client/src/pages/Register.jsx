import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    console.log('Registration attempt:', { name, email, password });
    
    if (!name || !email || !password) {
      alert('Παρακαλώ συμπληρώστε όλα τα πεδία');
      return;
    }
    
    try {
      console.log('Sending registration request...');
      const response = await axios.post('/auth/register', { name, email, password });
      console.log('Registration response:', response.data);
      alert('Εγγραφή επιτυχής! Μπορείτε να συνδεθείτε.');
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      const message = err.response?.data?.error || 'Κάτι πήγε λάθος στην εγγραφή';
      alert(message);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Εγγραφή</h2>
      <div>
        <input
          placeholder="Όνομα"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ display: 'block', margin: '0.5rem 0' }}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ display: 'block', margin: '0.5rem 0' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ display: 'block', margin: '0.5rem 0' }}
        />
        <button onClick={handleRegister}>Εγγραφή</button>
      </div>
    </div>
  );
}