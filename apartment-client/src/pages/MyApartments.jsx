import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { toast } from '../components/Toast';
import { useUser } from '../context/UserContext';

function MyApartments() {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyApartments();
  }, []);

  const fetchMyApartments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/apartments/my');
      setApartments(response.data);
    } catch (error) {
      console.error('Error fetching apartments:', error);
      toast.error('Σφάλμα κατά τη φόρτωση των διαμερισμάτων');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (apartmentId) => {
    if (!window.confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το διαμέρισμα;')) {
      return;
    }

    try {
      await axios.delete(`/apartments/${apartmentId}`);
      toast.success('Το διαμέρισμα διαγράφηκε επιτυχώς');
      fetchMyApartments();
    } catch (error) {
      console.error('Error deleting apartment:', error);
      toast.error('Σφάλμα κατά τη διαγραφή του διαμερίσματος');
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Φόρτωση...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Τα Διαμερίσματά Μου</h2>
            <Link to="/create-apartment" className="btn btn-primary">
              <i className="fas fa-plus"></i> Νέο Διαμέρισμα
            </Link>
          </div>

          {apartments.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-home fa-3x text-muted mb-3"></i>
              <h4 className="text-muted">Δεν έχετε διαμερίσματα</h4>
              <p className="text-muted">Δημιουργήστε το πρώτο σας διαμέρισμα για να ξεκινήσετε</p>
              <Link to="/create-apartment" className="btn btn-primary">
                Δημιουργία Διαμερίσματος
              </Link>
            </div>
          ) : (
            <div className="row">
              {apartments.map(apartment => (
                <div key={apartment._id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card h-100">
                    {apartment.images && apartment.images.length > 0 && (
                      <img 
                        src={apartment.images[0]} 
                        className="card-img-top" 
                        alt={apartment.title}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    )}
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{apartment.title}</h5>
                      <p className="card-text text-muted">
                        <i className="fas fa-map-marker-alt"></i> {apartment.location}
                      </p>
                      <p className="card-text">
                        <small className="text-muted">{apartment.description?.substring(0, 100)}...</small>
                      </p>
                      <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="h5 text-primary mb-0">€{apartment.pricePerNight}/νύχτα</span>
                          <span className="badge bg-success">{apartment.bedrooms} δωμάτια</span>
                        </div>
                        
                        <div className="btn-group w-100" role="group">
                          <Link 
                            to={`/apartments/${apartment._id}`} 
                            className="btn btn-outline-primary btn-sm"
                            title="Προβολή"
                          >
                            <i className="fas fa-eye"></i>
                          </Link>
                          <Link 
                            to={`/edit-apartment/${apartment._id}`} 
                            className="btn btn-outline-secondary btn-sm"
                            title="Επεξεργασία"
                          >
                            <i className="fas fa-edit"></i>
                          </Link>
                          <Link 
                            to={`/manage-availability/${apartment._id}`} 
                            className="btn btn-outline-warning btn-sm"
                            title="Διαχείριση Διαθεσιμότητας"
                          >
                            <i className="fas fa-calendar-times"></i>
                          </Link>
                          <button 
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(apartment._id)}
                            title="Διαγραφή"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyApartments;
