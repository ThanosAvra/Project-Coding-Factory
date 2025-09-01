import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { LoadingSpinner, SkeletonCard } from '../components/LoadingSpinner';
import { toast } from '../components/Toast';

export default function Home() {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage on component mount
    const loadUser = () => {
      try {
        const userData = localStorage.getItem('user');
        console.log('Loaded user data from localStorage:', userData);
        if (userData) {
          const parsedUser = JSON.parse(userData);
          console.log('Parsed user data:', parsedUser);
          setCurrentUser(parsedUser);
        } else {
          console.log('No user data found in localStorage');
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
        console.error('Error parsing user data:', e);
        localStorage.removeItem('user');
      }
    }
  }, []);

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

  const isOwner = (apartment) => {
    if (!currentUser) {
      console.log('No current user');
      return false;
    }
    
    const userId = currentUser.id || currentUser._id;
    const ownerId = apartment.owner?._id || apartment.owner;
    
    console.log('Checking ownership:', {
      userId,
      ownerId,
      apartmentId: apartment._id,
      currentUser
    });
    
    return ownerId === userId;
  };

  const isAdmin = () => {
    const isAdmin = currentUser?.role === 'ADMIN';
    console.log('Is admin:', isAdmin, 'User role:', currentUser?.role);
    return isAdmin;
  };

  const handleDelete = async (apartmentId) => {
    if (!window.confirm('Είστε σίγουρος ότι θέλετε να διαγράψετε αυτό το διαμέρισμα;')) {
      return;
    }

    try {
      setDeletingId(apartmentId);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      console.log('=== Delete Debug ===');
      console.log('Apartment ID:', apartmentId);
      console.log('Current User ID:', user?.id);
      console.log('User Role:', user?.role);
      console.log('Token exists:', !!token);
      
      const response = await axios.delete(`/apartments/${apartmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Delete response:', response.data);
      
      // Update the UI by filtering out the deleted apartment
      setApartments(prev => prev.filter(apt => apt._id !== apartmentId));
      toast.success('Το διαμέρισμα διαγράφηκε επιτυχώς');
      
    } catch (err) {
      console.error('=== Delete Error ===');
      console.error('Error message:', err.message);
      console.error('Response status:', err.response?.status);
      console.error('Response data:', err.response?.data);
      console.error('Response headers:', err.response?.headers);
      
      const errorMessage = err.response?.data?.error || 'Σφάλμα κατά τη διαγραφή του διαμερίσματος';
      console.error('Error details:', errorMessage);
      
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
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

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button
                    onClick={() => handleBooking(apartment._id)}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    <span style={{ marginRight: '0.5rem' }}>📅</span>
                    Κράτηση
                  </button>
                  
                  {(isOwner(apartment) || isAdmin()) && (
                    <button
                      onClick={() => handleDelete(apartment._id)}
                      disabled={deletingId === apartment._id}
                      style={{
                        background: 'var(--danger-color)',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--border-radius-sm)',
                        cursor: 'pointer',
                        opacity: deletingId === apartment._id ? 0.7 : 1
                      }}
                    >
                      {deletingId === apartment._id ? (
                        <span>Διαγραφή...</span>
                      ) : (
                        <span>🗑️</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}