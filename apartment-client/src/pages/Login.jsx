import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import { toast } from '../components/Toast';
import { useUser } from '../context/UserContext';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useUser();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('/users/login', formData);
      const { token } = response.data;
      
      // Get user data from token payload or make another request
      const userResponse = await axios.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Store token and update user context
      login(userResponse.data, token);
      
      toast.success(`Καλώς ήρθατε ${userResponse.data.name}!`);
      
      // Redirect to home or previous page
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Σφάλμα κατά τη σύνδεση';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem 1rem' }}>
      <div className="auth-card" style={{ 
        maxWidth: '400px', 
        width: '100%',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        padding: '2.5rem',
        border: 'none'
      }}>
        <div className="text-center mb-4">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏠</div>
          <h2 style={{ 
            color: '#2c3e50', 
            fontWeight: '700', 
            marginBottom: '0.5rem',
            fontSize: '1.75rem'
          }}>
            Σύνδεση Χρήστη
          </h2>
          <p style={{ color: '#6c757d', margin: '0' }}>Συνδεθείτε στον λογαριασμό σας</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group" style={{ marginBottom: '0' }}>
            <label 
              htmlFor="email" 
              style={{ 
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontWeight: '500',
                fontSize: '0.875rem'
              }}
            >
              📧 Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="example@email.com"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                outline: 'none',
                backgroundColor: 'white',
                color: '#1f2937'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.backgroundColor = 'white';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.backgroundColor = 'white';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '0' }}>
            <label 
              htmlFor="password" 
              style={{ 
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontWeight: '500',
                fontSize: '0.875rem'
              }}
            >
              🔒 Κωδικός Πρόσβασης
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                outline: 'none',
                backgroundColor: 'white',
                color: '#1f2937',
                fontWeight: '400'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.backgroundColor = 'white';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.backgroundColor = 'white';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              transform: loading ? 'none' : 'translateY(0)',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span style={{ 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></span>
                Σύνδεση...
              </span>
            ) : (
              '🚀 Σύνδεση'
            )}
          </button>
        </form>

        <div className="text-center" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
          <p style={{ color: '#6b7280', margin: '0', fontSize: '0.875rem' }}>
            Δεν έχετε λογαριασμό;{' '}
            <Link 
              to="/register" 
              style={{ 
                color: '#667eea', 
                textDecoration: 'none', 
                fontWeight: '600',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#5a67d8'}
              onMouseLeave={(e) => e.target.style.color = '#667eea'}
            >
              Εγγραφή εδώ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;