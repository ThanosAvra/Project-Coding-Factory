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
      const allUsersResponse = await axios.get('/admin/all-users');
      setAllUsers(allUsersResponse.data.data);
      
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
          <h4 className="mb-3">👥 Όλοι οι Χρήστες</h4>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Όνομα</th>
                  <th>Email</th>
                  <th>Ρόλος</th>
                  <th>Ημερομηνία Εγγραφής</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      {user.role === 'ADMIN' ? '👑 ' : '👤 '}
                      {user.name}
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role === 'ADMIN' ? 'bg-success' : 'bg-primary'}`}>
                        {user.role === 'ADMIN' ? 'Διαχειριστής' : 'Χρήστης'}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
