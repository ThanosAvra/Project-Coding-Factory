import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { toast } from '../components/Toast';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

export default function AdminUsers() {
  const [adminUsers, setAdminUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('admins');
  const [stats, setStats] = useState({});
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch admin users
      const adminResponse = await axios.get('/admin/users');
      setAdminUsers(adminResponse.data.data.adminUsers);
      setStats(adminResponse.data.data.stats);
      
      // Fetch all users
      const allUsersResponse = await axios.get('/users');
      setAllUsers(allUsersResponse.data);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Σφάλμα φόρτωσης χρηστών');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('el-GR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePromoteToAdmin = async (userId) => {
    const confirmed = window.confirm('🔥 ΠΡΟΣΟΧΗ: Θα κάνετε αυτόν τον χρήστη ΔΙΑΧΕΙΡΙΣΤΉ!\n\nΘα έχει πλήρη πρόσβαση στο σύστημα.\n\nΠατήστε OK για συνέχεια ή Cancel για ακύρωση.');
    
    if (!confirmed) {
      return;
    }

    try {
      const response = await axios.put(`/users/${userId}`, { role: 'ADMIN' });
      toast.success('Ο χρήστης προήχθη σε διαχειριστή επιτυχώς!');
      await fetchData(); // Refresh data
    } catch (error) {
      toast.error(`Σφάλμα: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDemoteFromAdmin = async (userId) => {
    if (!window.confirm('Είστε σίγουροι ότι θέλετε να αφαιρέσετε τα δικαιώματα διαχειριστή από αυτόν τον χρήστη;')) {
      return;
    }

    try {
      const response = await axios.put(`/users/${userId}`, { role: 'USER' });
      toast.success('Τα δικαιώματα διαχειριστή αφαιρέθηκαν επιτυχώς!');
      fetchData(); // Refresh data
    } catch (error) {
      toast.error(`Σφάλμα: ${error.response?.data?.message || error.message}`);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="container py-5 text-center">
        <h2>Δεν έχετε δικαίωμα πρόσβασης</h2>
        <p>Αυτή η σελίδα είναι διαθέσιμη μόνο για διαχειριστές.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <LoadingSpinner />
        <p className="mt-3">Φόρτωση χρηστών...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          <span className="gradient-text">Διαχείριση Χρηστών</span>
        </h1>
        <button 
          className="btn btn-outline-secondary"
          onClick={() => navigate('/admin')}
        >
          ← Επιστροφή στον Πίνακα Ελέγχου
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center" style={{ 
            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
            color: 'white',
            border: 'none'
          }}>
            <div className="card-body">
              <h3 className="mb-0">{stats.totalAdmins || 0}</h3>
              <p className="mb-0">👑 Διαχειριστές</p>
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
              <h3 className="mb-0">{stats.regularUsers || 0}</h3>
              <p className="mb-0">👤 Κανονικοί Χρήστες</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center" style={{ 
            background: 'linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)',
            color: 'white',
            border: 'none'
          }}>
            <div className="card-body">
              <h3 className="mb-0">{stats.totalUsers || 0}</h3>
              <p className="mb-0">📊 Σύνολο Χρηστών</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'admins' ? 'active' : ''}`}
            onClick={() => setActiveTab('admins')}
          >
            👑 Διαχειριστές ({adminUsers.length})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            👥 Όλοι οι Χρήστες ({allUsers.length})
          </button>
        </li>
      </ul>

      {/* Content */}
      {activeTab === 'admins' && (
        <div>
          <h4 className="mb-3">👑 Διαχειριστές Συστήματος</h4>
          {adminUsers.length === 0 ? (
            <div className="alert alert-warning">
              <h5>⚠️ Δεν βρέθηκαν διαχειριστές!</h5>
              <p>Αυτό είναι περίεργο. Θα πρέπει να υπάρχει τουλάχιστον ένας διαχειριστής.</p>
            </div>
          ) : (
            <div className="row">
              {adminUsers.map((admin) => (
                <div key={admin._id} className="col-md-6 mb-3">
                  <div className="card" style={{
                    border: '2px solid #28a745',
                    boxShadow: '0 4px 8px rgba(40, 167, 69, 0.1)'
                  }}>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 className="card-title mb-1">
                            👑 {admin.name}
                          </h5>
                          <p className="text-muted mb-1">{admin.email}</p>
                          <small className="text-muted">
                            Εγγραφή: {formatDate(admin.createdAt)}
                          </small>
                        </div>
                        <span className="badge bg-success">
                          ADMIN
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'all' && (
        <div>
          <h4 className="mb-4">👥 Όλοι οι Χρήστες ({allUsers.length})</h4>
          
          <div className="card shadow-sm border-0">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0" style={{ fontSize: '0.95rem' }}>
                  <thead style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}>
                    <tr>
                      <th className="border-0 py-3 px-4" style={{ fontWeight: '600', letterSpacing: '0.5px' }}>
                        👤 Χρήστης
                      </th>
                      <th className="border-0 py-3 px-4" style={{ fontWeight: '600', letterSpacing: '0.5px' }}>
                        📧 Email
                      </th>
                      <th className="border-0 py-3 px-4 text-center" style={{ fontWeight: '600', letterSpacing: '0.5px' }}>
                        🔐 Ρόλος
                      </th>
                      <th className="border-0 py-3 px-4 text-center" style={{ fontWeight: '600', letterSpacing: '0.5px' }}>
                        📅 Εγγραφή
                      </th>
                      <th className="border-0 py-3 px-4 text-center" style={{ fontWeight: '600', letterSpacing: '0.5px', minWidth: '220px' }}>
                        ⚡ Κατάσταση & Δικαιώματα
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((user, index) => (
                      <tr key={user._id} style={{ 
                        borderLeft: user.role === 'ADMIN' ? '4px solid #28a745' : '4px solid #007bff',
                        backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'
                      }}>
                        <td className="py-3 px-4 align-middle">
                          <div className="d-flex align-items-center">
                            <div className="me-3" style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: user.role === 'ADMIN' 
                                ? 'linear-gradient(135deg, #28a745, #20c997)' 
                                : 'linear-gradient(135deg, #007bff, #0056b3)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '1.2rem',
                              fontWeight: 'bold'
                            }}>
                              {user.role === 'ADMIN' ? '👑' : '👤'}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: '#2c3e50', fontSize: '1rem' }}>
                                {user.name}
                              </div>
                              <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                                ID: {user._id.slice(-8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-3 px-4 align-middle">
                          <div style={{ 
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                            color: '#495057',
                            background: '#e9ecef',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            display: 'inline-block'
                          }}>
                            {user.email}
                          </div>
                        </td>
                        
                        <td className="py-3 px-4 align-middle text-center">
                          <span className={`badge px-3 py-2 ${
                            user.role === 'ADMIN' 
                              ? 'bg-success' 
                              : 'bg-primary'
                          }`} style={{
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            letterSpacing: '0.5px'
                          }}>
                            {user.role === 'ADMIN' ? '👑 Διαχειριστής' : '👤 Χρήστης'}
                          </span>
                        </td>
                        
                        <td className="py-3 px-4 align-middle text-center">
                          <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                        
                        <td className="py-3 px-4 align-middle text-center">
                          <div className="d-flex flex-column align-items-center gap-2">
                            {user.role === 'ADMIN' ? (
                              <>
                                <span className="badge px-3 py-2" style={{
                                  background: 'linear-gradient(135deg, #ffc107, #ff8c00)',
                                  color: '#212529',
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  borderRadius: '20px',
                                  boxShadow: '0 2px 4px rgba(255, 193, 7, 0.3)'
                                }}>
                                  ⚡ Ενεργός Διαχειριστής
                                </span>
                                <div style={{ 
                                  fontSize: '0.75rem',
                                  color: '#28a745',
                                  fontWeight: '600',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  ✅ Πλήρη Δικαιώματα Συστήματος
                                </div>
                              </>
                            ) : (
                              <>
                                <span className="badge px-3 py-2" style={{
                                  background: 'linear-gradient(135deg, #17a2b8, #138496)',
                                  color: 'white',
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  borderRadius: '20px',
                                  boxShadow: '0 2px 4px rgba(23, 162, 184, 0.3)'
                                }}>
                                  👤 Ενεργός Χρήστης
                                </span>
                                <div style={{ 
                                  fontSize: '0.75rem',
                                  color: '#007bff',
                                  fontWeight: '600',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  🛡️ Βασικά Δικαιώματα Χρήστη
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
