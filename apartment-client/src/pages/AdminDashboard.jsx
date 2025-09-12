import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { toast } from '../components/Toast';
import { useUser } from '../context/UserContext';
import ProtectedRoute from '../components/ProtectedRoute';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, bookingsRes] = await Promise.all([
        axios.get('/users'),
        axios.get('/bookings')
      ]);
      setUsers(usersRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Σφάλμα φόρτωσης δεδομένων');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτόν τον χρήστη;')) {
      return;
    }

    try {
      await axios.delete(`/users/${userId}`);
      toast.success('Ο χρήστης διαγράφηκε επιτυχώς');
      fetchData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Σφάλμα κατά τη διαγραφή του χρήστη');
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await axios.patch(`/bookings/${bookingId}`, { status });
      toast.success('Η κατάσταση της κράτησης ενημερώθηκε');
      fetchData();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Σφάλμα κατά την ενημέρωση της κράτησης');
    }
  };

  if (loading) {
    return <div>Φόρτωση...</div>;
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="admin-dashboard">
        <h1>Πίνακας Διαχείρισης</h1>
        
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card text-center" style={{ 
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              color: 'white',
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/admin/users')}
            >
              <div className="card-body">
                <h3 className="mb-0">👑</h3>
                <p className="mb-0">Διαχείριση Χρηστών</p>
                <small>Δείτε όλους τους χρήστες και admins</small>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center" style={{ 
              background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
              color: 'white',
              border: 'none'
            }}>
              <div className="card-body">
                <h3 className="mb-0">📊</h3>
                <p className="mb-0">Στατιστικά</p>
                <small>Χρήστες: {users.length} | Κρατήσεις: {bookings.length}</small>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center" style={{ 
              background: 'linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)',
              color: 'white',
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/admin/blocked-dates')}
            >
              <div className="card-body">
                <h3 className="mb-0">📅</h3>
                <p className="mb-0">Αποκλεισμός Ημερομηνιών</p>
                <small>Διαχείριση αποκλεισμένων περιόδων</small>
              </div>
            </div>
          </div>
        </div>

        <div className="tabs mb-4">
          <button 
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
            style={{
              padding: '12px 24px',
              marginRight: '10px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: activeTab === 'users' ? '#007bff' : '#f8f9fa',
              color: activeTab === 'users' ? 'white' : '#495057',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            👥 Χρήστες
          </button>
          <button 
            className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: activeTab === 'bookings' ? '#007bff' : '#f8f9fa',
              color: activeTab === 'bookings' ? 'white' : '#495057',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            📋 Κρατήσεις
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="users-table mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4 p-3" style={{ 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <div>
                <h2 className="mb-1">👥 Διαχείριση Χρηστών</h2>
                <small className="text-muted">Προβολή και διαχείριση όλων των εγγεγραμμένων χρηστών</small>
              </div>
              <div className="text-end">
                <span className="badge bg-gradient bg-info text-white px-4 py-3" style={{ 
                  fontSize: '14px',
                  fontWeight: '600',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,123,255,0.3)'
                }}>
                  <i className="fas fa-users me-2"></i>
                  Σύνολο: {users.length} χρήστες
                </span>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-striped table-hover" style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <thead style={{ backgroundColor: '#f8f9fa' }}>
                  <tr>
                    <th style={{ padding: '15px', fontWeight: '600' }}>ID</th>
                    <th style={{ padding: '15px', fontWeight: '600' }}>Όνομα</th>
                    <th style={{ padding: '15px', fontWeight: '600' }}>Email</th>
                    <th style={{ padding: '15px', fontWeight: '600' }}>Ρόλος</th>
                    <th style={{ padding: '15px', fontWeight: '600' }}>Ενέργειες</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '20px 15px', verticalAlign: 'middle' }}>
                        <code style={{ backgroundColor: '#f8f9fa', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                          {user._id.substring(0, 6)}...
                        </code>
                      </td>
                      <td style={{ padding: '20px 15px', verticalAlign: 'middle', fontWeight: '500' }}>
                        {user.role === 'ADMIN' ? '👑 ' : '👤 '}
                        {user.name}
                      </td>
                      <td style={{ padding: '20px 15px', verticalAlign: 'middle', color: '#6c757d' }}>
                        {user.email}
                      </td>
                      <td style={{ padding: '20px 15px', verticalAlign: 'middle' }}>
                        <span className={`badge ${user.role === 'ADMIN' ? 'bg-success' : 'bg-primary'} px-3 py-2`} style={{ fontSize: '12px' }}>
                          {user.role === 'ADMIN' ? 'Διαχειριστής' : 'Χρήστης'}
                        </span>
                      </td>
                      <td style={{ padding: '20px 15px', verticalAlign: 'middle' }}>
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={user._id === user?._id}
                          style={{ 
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontWeight: '500',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          🗑️ Διαγραφή
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bookings-table mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4 p-3" style={{ 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <div>
                <h2 className="mb-1">📋 Διαχείριση Κρατήσεων</h2>
                <small className="text-muted">Προβολή και διαχείριση όλων των κρατήσεων του συστήματος</small>
              </div>
              <div className="text-end">
                <span className="badge bg-gradient bg-warning text-dark px-4 py-3" style={{ 
                  fontSize: '14px',
                  fontWeight: '600',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(255,193,7,0.3)'
                }}>
                  <i className="fas fa-calendar-check me-2"></i>
                  Σύνολο: {bookings.length} κρατήσεις
                </span>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-striped table-hover" style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <thead style={{ backgroundColor: '#f8f9fa' }}>
                  <tr>
                    <th style={{ padding: '15px', fontWeight: '600' }}>ID</th>
                    <th style={{ padding: '15px', fontWeight: '600' }}>Διαμέρισμα</th>
                    <th style={{ padding: '15px', fontWeight: '600' }}>Πελάτης</th>
                    <th style={{ padding: '15px', fontWeight: '600' }}>Ημερομηνίες</th>
                    <th style={{ padding: '15px', fontWeight: '600' }}>Κατάσταση</th>
                    <th style={{ padding: '15px', fontWeight: '600' }}>Ενέργειες</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '20px 15px', verticalAlign: 'middle' }}>
                        <code style={{ backgroundColor: '#f8f9fa', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                          {booking._id.substring(0, 6)}...
                        </code>
                      </td>
                      <td style={{ padding: '20px 15px', verticalAlign: 'middle', fontWeight: '500' }}>
                        🏠 {booking.apartment?.title || 'Δεν βρέθηκε'}
                      </td>
                      <td style={{ padding: '20px 15px', verticalAlign: 'middle', color: '#6c757d' }}>
                        👤 {booking.user?.name || 'Άγνωστος'}
                      </td>
                      <td style={{ padding: '20px 15px', verticalAlign: 'middle', fontSize: '14px' }}>
                        <div className="d-flex flex-column">
                          <span>📅 {new Date(booking.startDate).toLocaleDateString('el-GR')}</span>
                          <span className="text-muted">📅 {new Date(booking.endDate).toLocaleDateString('el-GR')}</span>
                        </div>
                      </td>
                      <td style={{ padding: '20px 15px', verticalAlign: 'middle' }}>
                        <span className={`badge px-3 py-2 ${
                          booking.status === 'PENDING' ? 'bg-warning text-dark' :
                          booking.status === 'CONFIRMED' ? 'bg-success' : 'bg-danger'
                        }`} style={{ fontSize: '12px' }}>
                          {booking.status === 'PENDING' && '⏳ Εκκρεμεί'}
                          {booking.status === 'CONFIRMED' && '✅ Επιβεβαιωμένη'}
                          {booking.status === 'CANCELLED' && '❌ Ακυρωμένη'}
                        </span>
                      </td>
                      <td style={{ padding: '20px 15px', verticalAlign: 'middle' }}>
                        <div className="d-flex gap-2">
                          {booking.status === 'PENDING' && (
                            <>
                              <button 
                                className="btn btn-outline-success btn-sm"
                                onClick={() => handleUpdateBookingStatus(booking._id, 'CONFIRMED')}
                                style={{ 
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  fontWeight: '500',
                                  fontSize: '12px'
                                }}
                              >
                                ✅ Επιβεβαίωση
                              </button>
                              <button 
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleUpdateBookingStatus(booking._id, 'CANCELLED')}
                                style={{ 
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  fontWeight: '500',
                                  fontSize: '12px'
                                }}
                              >
                                ❌ Ακύρωση
                              </button>
                            </>
                          )}
                          {booking.status === 'CONFIRMED' && (
                            <button 
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleUpdateBookingStatus(booking._id, 'CANCELLED')}
                              style={{ 
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontWeight: '500',
                                fontSize: '12px'
                              }}
                            >
                              ❌ Ακύρωση
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

export default AdminDashboard;
