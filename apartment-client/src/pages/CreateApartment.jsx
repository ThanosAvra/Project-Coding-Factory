import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { toast } from '../components/Toast';

export default function CreateApartment() {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    pricePerNight: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.warning('Πρέπει να συνδεθείτε για να δημιουργήσετε διαμέρισμα');
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.location || !formData.pricePerNight) {
      toast.warning('Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία');
      return;
    }

    if (formData.pricePerNight <= 0) {
      toast.error('Η τιμή πρέπει να είναι μεγαλύτερη από 0');
      return;
    }

    setLoading(true);

    try {
      const apartmentData = {
        ...formData,
        pricePerNight: parseFloat(formData.pricePerNight)
      };

      await axios.post('/apartments', apartmentData);
      toast.success('Το διαμέρισμα δημιουργήθηκε επιτυχώς!');
      navigate('/');
    } catch (err) {
      console.error('Error creating apartment:', err);
      toast.error(err.response?.data?.error || 'Σφάλμα κατά τη δημιουργία του διαμερίσματος');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="text-center mb-4">
        <h1 style={{ 
          background: 'var(--secondary-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🏠 Νέο Διαμέρισμα
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Προσθέστε το διαμέρισμά σας στην πλατφόρμα
        </p>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">🏷️ Τίτλος *</label>
              <input
                type="text"
                name="title"
                className="form-input"
                value={formData.title}
                onChange={handleChange}
                placeholder="π.χ. Όμορφο διαμέρισμα στο κέντρο"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">📍 Τοποθεσία *</label>
              <input
                type="text"
                name="location"
                className="form-input"
                value={formData.location}
                onChange={handleChange}
                placeholder="π.χ. Αθήνα, Θεσσαλονίκη"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">💰 Τιμή ανά βραδιά (€) *</label>
              <input
                type="number"
                name="pricePerNight"
                className="form-input"
                value={formData.pricePerNight}
                onChange={handleChange}
                placeholder="π.χ. 50"
                min="1"
                step="0.01"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">📝 Περιγραφή</label>
              <textarea
                name="description"
                className="form-input"
                value={formData.description}
                onChange={handleChange}
                placeholder="Περιγράψτε το διαμέρισμά σας..."
                rows="4"
                disabled={loading}
                style={{ resize: 'vertical', minHeight: '100px' }}
              />
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'flex-end',
              marginTop: '2rem'
            }}>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn btn-outline"
                disabled={loading}
              >
                ❌ Ακύρωση
              </button>
              
              <button
                type="submit"
                className="btn btn-secondary"
                disabled={loading}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem'
                }}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    Δημιουργία...
                  </>
                ) : (
                  <>
                    <span>✅</span>
                    Δημιουργία Διαμερίσματος
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem', background: 'var(--info-gradient)', color: 'white' }}>
        <div className="card-body">
          <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            💡 Συμβουλές
          </h4>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            <li>Χρησιμοποιήστε περιγραφικό τίτλο</li>
            <li>Αναφέρετε την ακριβή περιοχή</li>
            <li>Βάλτε ανταγωνιστική τιμή</li>
            <li>Γράψτε λεπτομερή περιγραφή</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
