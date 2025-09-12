import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import axios from '../api/axios';
import { toast } from 'react-toastify';

const AdminBlockedDates = () => {
  const [blockedDates, setBlockedDates] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    apartmentId: ''
  });
  const { user } = useUser();

  useEffect(() => {
    fetchBlockedDates();
    fetchApartments();
  }, []);

  const fetchBlockedDates = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/blocked-dates');
      setBlockedDates(response.data);
    } catch (error) {
      console.error('Σφάλμα φόρτωσης αποκλεισμών:', error);
      toast.error('Αδυναμία φόρτωσης αποκλεισμών ημερομηνιών');
    } finally {
      setLoading(false);
    }
  };

  const fetchApartments = async () => {
    try {
      const response = await axios.get('/apartments');
      setApartments(response.data);
    } catch (error) {
      console.error('Σφάλμα φόρτωσης διαμερισμάτων:', error);
      toast.error('Αδυναμία φόρτωσης διαμερισμάτων');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
      toast.error('Συμπληρώστε όλα τα υποχρεωτικά πεδία');
      return;
    }
    
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('Η ημερομηνία λήξης πρέπει να είναι μετά την ημερομηνία έναρξης');
      return;
    }

    try {
      await axios.post('/blocked-dates', {
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        apartmentId: formData.apartmentId || undefined
      });
      
      toast.success('Ο αποκλεισμός ημερομηνιών προστέθηκε επιτυχώς');
      setFormData({
        startDate: '',
        endDate: '',
        reason: '',
        apartmentId: ''
      });
      fetchBlockedDates();
    } catch (error) {
      console.error('Σφάλμα δημιουργίας αποκλεισμού:', error);
      const errorMessage = error.response?.data?.error || 'Αποτυχία δημιουργίας αποκλεισμού';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Είστε σίγουροι ότι θέλετε να αφαιρέσετε αυτόν τον αποκλεισμό;')) {
      return;
    }
    
    try {
      await axios.delete(`/blocked-dates/${id}`);
      toast.success('Ο αποκλεισμός αφαιρέθηκε επιτυχώς');
      fetchBlockedDates();
    } catch (error) {
      console.error('Σφάλμα διαγραφής αποκλεισμού:', error);
      toast.error('Αποτυχία διαγραφής αποκλεισμού');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('el-GR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          📅 Διαχείριση Αποκλεισμών Ημερομηνιών
        </h2>
      </div>

      {/* Φόρμα προσθήκης νέου αποκλεισμού */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">
            ➕ Προσθήκη Νέου Αποκλεισμού
          </h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Ημ/νία Έναρξης *</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Ημ/νία Λήξης *</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Διαμέρισμα (προαιρετικό)</label>
                <select
                  className="form-select"
                  value={formData.apartmentId}
                  onChange={(e) => setFormData({...formData, apartmentId: e.target.value})}
                >
                  <option value="">🏢 Όλα τα διαμερίσματα</option>
                  {apartments.map(apt => (
                    <option key={apt._id} value={apt._id}>
                      🏠 {apt.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Λόγος Αποκλεισμού *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="π.χ. Συντήρηση, Ανακαίνιση"
                  required
                />
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-primary">
                  📅 Αποθήκευση Αποκλεισμού
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Λίστα αποκλεισμών */}
      <div className="card shadow-sm">
        <div className="card-header bg-light">
          <h5 className="mb-0">
            📋 Λίστα Αποκλεισμών ({blockedDates.length})
          </h5>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Φόρτωση...</span>
              </div>
            </div>
          ) : blockedDates.length === 0 ? (
            <div className="text-center p-4 text-muted">
              <p className="mb-0">📅 Δεν βρέθηκαν αποκλεισμοί ημερομηνιών</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>📅 Ημερομηνίες</th>
                    <th>🏠 Διαμέρισμα</th>
                    <th>📝 Λόγος</th>
                    <th>👤 Δημιουργήθηκε από</th>
                    <th>📆 Ημ/νία Δημιουργίας</th>
                    <th>⚙️ Ενέργειες</th>
                  </tr>
                </thead>
                <tbody>
                  {blockedDates.map((block) => (
                    <tr key={block._id}>
                      <td>
                        <div className="d-flex flex-column">
                          <span className="fw-medium">
                            {formatDate(block.startDate)} έως {formatDate(block.endDate)}
                          </span>
                          <small className="text-muted">
                            {Math.ceil((new Date(block.endDate) - new Date(block.startDate)) / (1000 * 60 * 60 * 24))} ημέρες
                          </small>
                        </div>
                      </td>
                      <td>
                        {block.apartment ? (
                          <span className="badge bg-primary">
                            🏠 {block.apartment.title}
                          </span>
                        ) : (
                          <span className="badge bg-warning text-dark">
                            🏢 Όλα τα διαμερίσματα
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="text-muted">📝</span> {block.reason}
                      </td>
                      <td>
                        <div>
                          <span className="fw-medium">👤 {block.createdBy?.name || 'Σύστημα'}</span>
                          {block.createdBy?.email && (
                            <div className="text-muted small">📧 {block.createdBy.email}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        📆 {formatDate(block.createdAt)}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(block._id)}
                          title="Διαγραφή αποκλεισμού"
                        >
                          🗑️ Διαγραφή
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
  );
};

export default AdminBlockedDates;
