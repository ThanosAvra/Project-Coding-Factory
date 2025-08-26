import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { toast } from '../components/Toast';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      toast.warning('Παρακαλώ συμπληρώστε όλα τα πεδία');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Οι κωδικοί δεν ταιριάζουν');
      return;
    }
    
    if (password.length < 6) {
      toast.warning('Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Attempting registration with:', { name, email, password });
      const res = await axios.post('/auth/register', { name, email, password });
      console.log('Registration response:', res.data);
      toast.success('Επιτυχής εγγραφή! Μπορείτε τώρα να συνδεθείτε.');
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      toast.error(err.response?.data?.error || 'Σφάλμα εγγραφής');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '70vh' 
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px' }}>
        <div className="card-header text-center">
          <h2 style={{ 
            margin: 0,
            background: 'var(--secondary-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            ✨ Εγγραφή
          </h2>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>
            Δημιουργήστε τον λογαριασμό σας
          </p>
        </div>
        
        <div className="card-body">
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">👤 Όνομα:</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Εισάγετε το όνομά σας"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">📧 Email:</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Εισάγετε το email σας"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">🔒 Κωδικός:</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Τουλάχιστον 6 χαρακτήρες"
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">🔐 Επιβεβαίωση Κωδικού:</label>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Επαναλάβετε τον κωδικό"
                required
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-secondary w-full"
              disabled={loading}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  Εγγραφή...
                </>
              ) : (
                <>
                  <span>🎉</span>
                  Εγγραφή
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="card-footer text-center">
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            Έχετε ήδη λογαριασμό;{' '}
            <Link 
              to="/login" 
              style={{ 
                color: 'var(--primary-color)', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Συνδεθείτε εδώ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}