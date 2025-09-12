import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { toast } from '../components/Toast';
import { useUser } from '../context/UserContext';

function ManageAvailability() {
  const { apartmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [apartment, setApartment] = useState(null);
  const [availabilityPeriods, setAvailabilityPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: 'BLOCKED',
    notes: ''
  });

  useEffect(() => {
    if (apartmentId) {
      fetchApartmentAndAvailability();
    }
  }, [apartmentId]);

  const fetchApartmentAndAvailability = async () => {
    try {
      setLoading(true);
      const [apartmentRes, availabilityRes] = await Promise.all([
        axios.get(`/apartments/${apartmentId}`),
        axios.get(`/availability/apartment/${apartmentId}`)
      ]);
      
      setApartment(apartmentRes.data);
      setAvailabilityPeriods(availabilityRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Σφάλμα κατά τη φόρτωση των δεδομένων');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate) {
      toast.error('Παρακαλώ συμπληρώστε όλες τις ημερομηνίες');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('Η ημερομηνία λήξης πρέπει να είναι μετά την ημερομηνία έναρξης');
      return;
    }

    try {
      await axios.post('/availability/block', {
        apartmentId,
        ...formData
      });
      
      toast.success('Οι ημερομηνίες μπλοκαρίστηκαν επιτυχώς');
      setShowForm(false);
      setFormData({
        startDate: '',
        endDate: '',
        reason: 'BLOCKED',
        notes: ''
      });
      fetchApartmentAndAvailability();
    } catch (error) {
      console.error('Error blocking dates:', error);
      toast.error(error.response?.data?.error || 'Σφάλμα κατά το μπλοκάρισμα των ημερομηνιών');
    }
  };

  const handleDelete = async (availabilityId) => {
    if (!window.confirm('Είστε σίγουροι ότι θέλετε να ξεμπλοκάρετε αυτές τις ημερομηνίες;')) {
      return;
    }

    try {
      await axios.delete(`/availability/${availabilityId}`);
      toast.success('Οι ημερομηνίες ξεμπλοκαρίστηκαν επιτυχώς');
      fetchApartmentAndAvailability();
    } catch (error) {
      console.error('Error unblocking dates:', error);
      toast.error(error.response?.data?.error || 'Σφάλμα κατά το ξεμπλοκάρισμα');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('el-GR');
  };

  const getReasonText = (reason) => {
    const reasons = {
      'MAINTENANCE': 'Συντήρηση',
      'PERSONAL_USE': 'Προσωπική Χρήση',
      'RENOVATION': 'Ανακαίνιση',
      'BLOCKED': 'Μπλοκαρισμένο',
      'OTHER': 'Άλλο'
    };
    return reasons[reason] || reason;
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

  if (!apartment) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          Το διαμέρισμα δεν βρέθηκε
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2>Διαχείριση Διαθεσιμότητας</h2>
              <h5 className="text-muted">{apartment.title}</h5>
            </div>
            <div>
              <button 
                className="btn btn-secondary me-2"
                onClick={() => navigate('/my-apartments')}
              >
                Πίσω
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? 'Ακύρωση' : 'Μπλοκάρισμα Ημερομηνιών'}
              </button>
            </div>
          </div>

          {showForm && (
            <div className="card mb-4">
              <div className="card-header">
                <h5>Μπλοκάρισμα Ημερομηνιών</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Ημερομηνία Έναρξης</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.startDate}
                          onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Ημερομηνία Λήξης</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.endDate}
                          onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Λόγος</label>
                    <select
                      className="form-select"
                      value={formData.reason}
                      onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    >
                      <option value="BLOCKED">Μπλοκαρισμένο</option>
                      <option value="MAINTENANCE">Συντήρηση</option>
                      <option value="PERSONAL_USE">Προσωπική Χρήση</option>
                      <option value="RENOVATION">Ανακαίνιση</option>
                      <option value="OTHER">Άλλο</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Σημειώσεις (προαιρετικό)</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Προσθέστε επιπλέον πληροφορίες..."
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">
                      Μπλοκάρισμα
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowForm(false)}
                    >
                      Ακύρωση
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h5>Μπλοκαρισμένες Περίοδοι</h5>
            </div>
            <div className="card-body">
              {availabilityPeriods.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <i className="fas fa-calendar-check fa-3x mb-3"></i>
                  <p>Δεν υπάρχουν μπλοκαρισμένες περίοδοι</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Περίοδος</th>
                        <th>Λόγος</th>
                        <th>Σημειώσεις</th>
                        <th>Δημιουργήθηκε</th>
                        <th>Ενέργειες</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availabilityPeriods.map(period => (
                        <tr key={period._id}>
                          <td>
                            <strong>
                              {formatDate(period.startDate)} - {formatDate(period.endDate)}
                            </strong>
                          </td>
                          <td>
                            <span className={`badge bg-${period.reason === 'MAINTENANCE' ? 'warning' : 
                              period.reason === 'PERSONAL_USE' ? 'info' : 
                              period.reason === 'RENOVATION' ? 'danger' : 'secondary'}`}>
                              {getReasonText(period.reason)}
                            </span>
                          </td>
                          <td>{period.notes || '-'}</td>
                          <td>{formatDate(period.createdAt)}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(period._id)}
                              title="Ξεμπλοκάρισμα"
                            >
                              <i className="fas fa-unlock"></i> Ξεμπλοκάρισμα
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageAvailability;
