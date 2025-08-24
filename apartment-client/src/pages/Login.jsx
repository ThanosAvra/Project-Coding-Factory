import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      alert('Σύνδεση επιτυχής!');
      // Navigate to home page and force refresh
      navigate('/');
      setTimeout(() => window.location.reload(), 100);
    } catch (err) {
      const message = err.response?.data?.error || 'Λάθος στοιχεία';
      alert(message);
      console.error('Login error:', err.response?.data);
    }
  };

  return (
    <div>
      <h2>Σύνδεση</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Σύνδεση</button>
    </div>
  );
}