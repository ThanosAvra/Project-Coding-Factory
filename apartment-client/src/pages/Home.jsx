import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { LoadingSpinner, SkeletonCard } from '../components/LoadingSpinner';
import { toast } from '../components/Toast';
import { useUser } from '../context/UserContext';

export default function Home() {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const { user } = useUser();
  const navigate = useNavigate();

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

  const handleViewDetails = (apartmentId) => {
    navigate(`/apartments/${apartmentId}`);
  };

  const handleBooking = (apartmentId) => {
    if (!user) {
      toast.warning('Παρακαλώ συνδεθείτε πρώτα');
      navigate('/login');
      return;
    }
    navigate(`/booking/${apartmentId}`);
  };

  const isOwner = (apartment) => {
    if (!user) {
      return false;
    }
    
    const userId = user.id || user._id;
    const ownerId = apartment.owner?._id || apartment.owner;
    
    return ownerId === userId;
  };

  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  const handleDelete = async (apartmentId) => {
    if (!window.confirm('Είστε σίγουρος ότι θέλετε να διαγράψετε αυτό το διαμέρισμα;')) {
      return;
    }

    try {
      setDeletingId(apartmentId);
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(`/apartments/${apartmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
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
      {/* Hero Section with Background */}
      <div style={{
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'white',
        marginBottom: '3rem',
        borderRadius: '0 0 2rem 2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          maxWidth: '800px',
          padding: '2rem',
          zIndex: 2
        }}>
          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '700',
            marginBottom: '1.5rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            background: 'linear-gradient(135deg, #fff, #f0f8ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🏠 Βρείτε το Ιδανικό Διαμέρισμα
          </h1>
          <p style={{ 
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', 
            marginBottom: '2rem',
            textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
            lineHeight: '1.6'
          }}>
            Ανακαλύψτε τα καλύτερα διαμερίσματα για τη διαμονή σας.<br/>
            Άνεση, στυλ και αξεπέραστες τιμές σας περιμένουν!
          </p>
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              padding: '1rem 1.5rem',
              borderRadius: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>✨</span>
              Πολυτελή Διαμερίσματα
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              padding: '1rem 1.5rem',
              borderRadius: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>🌟</span>
              Άμεση Κράτηση
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              padding: '1rem 1.5rem',
              borderRadius: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>💎</span>
              Καλύτερες Τιμές
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mb-5">
        <h2 style={{ 
          background: 'var(--primary-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: '2.5rem',
          marginBottom: '1rem'
        }}>
          Διαθέσιμα Διαμερίσματα
        </h2>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
          Επιλέξτε από τη συλλογή μας τα πιο εντυπωσιακά διαμερίσματα
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
                    onClick={() => handleViewDetails(apartment._id)}
                    className="btn btn-outline-primary"
                    style={{ flex: 1 }}
                  >
                    Προβολή
                  </button>
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