import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from '../components/Toast';
import { useUser } from '../context/UserContext';

export default function ApartmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApartment = async () => {
      try {
        const response = await axios.get(`/apartments/${id}`);
        setApartment(response.data);
      } catch (error) {
        console.error('Error fetching apartment:', error);
        toast.error('Σφάλμα κατά τη φόρτωση του διαμερίσματος');
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchApartment();
    }
  }, [id, navigate]);

  const handleBookNow = () => {
    navigate(`/booking/${apartment._id}`);
  };

  const handleEdit = () => {
    navigate(`/apartment/${apartment._id}/edit`);
  };

  // Έλεγχος αν ο χρήστης μπορεί να επεξεργαστεί το διαμέρισμα
  const canEdit = user && apartment && (
    user.role === 'ADMIN' || 
    (apartment.owner && apartment.owner._id && user._id && 
     apartment.owner._id.toString() === user._id.toString())
  );

  // Debug logging
  console.log('canEdit check:', {
    user: user,
    userRole: user?.role,
    user_id: user?._id,
    apartment: apartment,
    ownerId: apartment?.owner?._id,
    canEdit: canEdit
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!apartment) {
    return (
      <div className="text-center">
        <h2>Διαμέρισμα δεν βρέθηκε</h2>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Επιστροφή στην αρχική
        </button>
      </div>
    );
  }

  return (
    <div className="apartment-details">
      <div className="row">
        <div className="col-md-7">
          <div className="apartment-images">
            {apartment.images && apartment.images.length > 0 ? (
              <div>
                <img 
                  src={apartment.images[0]} 
                  alt={apartment.title}
                  className="img-fluid rounded"
                  style={{ width: '100%', height: '400px', objectFit: 'cover', marginBottom: '1rem' }}
                />
                {apartment.images.length > 1 && (
                  <div className="row">
                    {apartment.images.slice(1).map((image, index) => (
                      <div key={index} className="col-md-4 col-sm-6" style={{ marginBottom: '1rem' }}>
                        <img
                          src={image}
                          alt={`${apartment.title} - ${index + 2}`}
                          className="img-fluid rounded"
                          style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div 
                className="placeholder-image d-flex align-items-center justify-content-center"
                style={{ 
                  height: '400px', 
                  backgroundColor: '#f8f9fa',
                  border: '2px dashed #dee2e6',
                  borderRadius: '8px'
                }}
              >
                <span style={{ fontSize: '1.2rem', color: '#6c757d' }}>
                  📷 Δεν υπάρχουν φωτογραφίες
                </span>
              </div>
            )}
          </div>

          <div className="apartment-info">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <h1 className="mb-0">{apartment.title}</h1>
              {canEdit && (
                <button 
                  onClick={handleEdit}
                  className="btn btn-outline-primary"
                  style={{ marginLeft: '1rem' }}
                >
                  ✏️ Επεξεργασία
                </button>
              )}
            </div>
            
            <div className="mb-3">
              <h5>📍 Τοποθεσία</h5>
              <p className="text-muted">{apartment.location}</p>
            </div>

            <div className="mb-3">
              <h5>📝 Περιγραφή</h5>
              <p>{apartment.description || 'Δεν υπάρχει περιγραφή διαθέσιμη.'}</p>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <h5>🏠 Χαρακτηριστικά</h5>
                <ul className="list-unstyled">
                  <li>🛏️ Κρεβάτια: {apartment.beds || 'Δεν καθορίστηκε'}</li>
                  <li>🚿 Μπάνια: {apartment.bathrooms || 'Δεν καθορίστηκε'}</li>
                  <li>👥 Μέγιστοι επισκέπτες: {apartment.maxGuests || 'Δεν καθορίστηκε'}</li>
                </ul>
              </div>
              
              <div className="col-md-6">
                <h5>🎯 Παροχές</h5>
                {apartment.amenities && apartment.amenities.length > 0 ? (
                  <ul className="list-unstyled">
                    {apartment.amenities.map((amenity, index) => (
                      <li key={index}>✓ {amenity}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">Δεν έχουν καθοριστεί παροχές</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-5">
          <div className="booking-card card" style={{
            position: 'sticky',
            top: '2rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '1rem',
            overflow: 'hidden'
          }}>
            <div className="card-body" style={{ padding: '2rem' }}>
              <div className="price-section mb-4" style={{
                textAlign: 'center',
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '0.8rem',
                color: 'white',
                marginBottom: '2rem'
              }}>
                <h2 style={{ 
                  margin: '0',
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}>
                  €{apartment.pricePerNight}
                </h2>
                <p style={{ 
                  margin: '0.5rem 0 0 0',
                  fontSize: '1.1rem',
                  opacity: '0.9'
                }}>
                  ανά βράδυ
                </p>
              </div>

              <div className="availability-info mb-4" style={{
                padding: '1rem',
                background: apartment.available ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                borderRadius: '0.8rem',
                border: `2px solid ${apartment.available ? 'rgba(40, 167, 69, 0.2)' : 'rgba(220, 53, 69, 0.2)'}`,
                textAlign: 'center'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '1.1rem',
                  fontWeight: '600'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>
                    {apartment.available ? '✅' : '❌'}
                  </span>
                  <span style={{ color: apartment.available ? '#28a745' : '#dc3545' }}>
                    {apartment.available ? 'Διαθέσιμο για κράτηση' : 'Μη διαθέσιμο'}
                  </span>
                </div>
              </div>

              <div className="booking-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {apartment.available && !canEdit && (
                  <button 
                    onClick={handleBookNow}
                    style={{
                      background: 'linear-gradient(135deg, #28a745, #20c997)',
                      color: 'white',
                      border: 'none',
                      padding: '1rem 2rem',
                      borderRadius: '0.8rem',
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.8rem'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)';
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>📅</span>
                    Κάντε κράτηση τώρα
                  </button>
                )}

                <button 
                  onClick={() => navigate(-1)}
                  style={{
                    background: 'transparent',
                    color: '#6c757d',
                    border: '2px solid #e9ecef',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '0.8rem',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.borderColor = '#6c757d';
                    e.target.style.color = '#495057';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.borderColor = '#e9ecef';
                    e.target.style.color = '#6c757d';
                  }}
                >
                  <span>←</span>
                  Επιστροφή
                </button>
              </div>
            </div>
          </div>

          {apartment.owner && (
            <div className="owner-info card mt-3">
              <div className="card-body">
                <h6>👤 Ιδιοκτήτης</h6>
                <p className="mb-0">{apartment.owner.name || 'Δεν καθορίστηκε'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
