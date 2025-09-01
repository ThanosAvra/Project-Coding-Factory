import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { toast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login } = useAuth();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Attempting login with:', { email });
      const res = await axios.post('/auth/login', { email, password });
      console.log('Login response:', res.data);
      
      if (!res.data.token) {
        throw new Error('No token received');
      }
      
      // Extract user data from response
      const userData = res.data.user || {};
      
      // Ensure we have all required user fields
      const user = {
        id: userData.id || userData._id,
        name: userData.name || email.split('@')[0],
        email: userData.email || email,
        role: userData.role || 'USER'
      };
      
      // Call the login function from AuthContext
      login(user, res.data.token);
      
      // Show success message
      toast.success(`Καλώς ήρθατε, ${user.name}!`);
      
      // Redirect to home page
      navigate('/');
      window.location.reload(); // Force reload to update navigation
    } catch (err) {
      console.error('Login error:', err);
      toast.error(err.response?.data?.error || 'Σφάλμα σύνδεσης');
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
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card-header text-center">
          <h2 style={{ 
            margin: 0,
            background: 'var(--primary-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🔐 Σύνδεση
          </h2>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>
            Συνδεθείτε στον λογαριασμό σας
          </p>
        </div>
        
        <div className="card-body">
          <form onSubmit={handleLogin}>
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
                placeholder="Εισάγετε τον κωδικό σας"
                required
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary w-full"
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
                  Σύνδεση...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  Σύνδεση
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="card-footer text-center">
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            Δεν έχετε λογαριασμό;{' '}
            <Link 
              to="/register" 
              style={{ 
                color: 'var(--primary-color)', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Εγγραφείτε εδώ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}