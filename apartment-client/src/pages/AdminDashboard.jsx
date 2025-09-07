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
    if (user?.role === 'admin') {
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
        
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Χρήστες
          </button>
          <button 
            className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            Κρατήσεις
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="users-table">
            <h2>Διαχείριση Χρηστών</h2>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Όνομα</th>
                  <th>Email</th>
                  <th>Ρόλος</th>
                  <th>Ενέργειες</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user._id.substring(0, 6)}...</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role === 'admin' ? 'Διαχειριστής' : 'Χρήστης'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteUser(user._id)}
                        disabled={user._id === user?._id}
                      >
                        Διαγραφή
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bookings-table">
            <h2>Διαχείριση Κρατήσεων</h2>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Διαμέρισμα</th>
                  <th>Πελάτης</th>
                  <th>Ημ/νίες</th>
                  <th>Κατάσταση</th>
                  <th>Ενέργειες</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking._id}>
                    <td>{booking._id.substring(0, 6)}...</td>
                    <td>{booking.apartment?.title || 'Δεν βρέθηκε'}</td>
                    <td>{booking.user?.name || 'Άγνωστος'}</td>
                    <td>
                      {new Date(booking.startDate).toLocaleDateString('el-GR')} - 
                      {new Date(booking.endDate).toLocaleDateString('el-GR')}
                    </td>
                    <td>
                      <span className={`status-badge ${booking.status.toLowerCase()}`}>
                        {booking.status === 'PENDING' && 'Εκκρεμεί'}
                        {booking.status === 'CONFIRMED' && 'Επιβεβαιωμένη'}
                        {booking.status === 'CANCELLED' && 'Ακυρωμένη'}
                      </span>
                    </td>
                    <td>
                      {booking.status === 'PENDING' && (
                        <>
                          <button 
                            className="btn btn-success btn-sm me-2"
                            onClick={() => handleUpdateBookingStatus(booking._id, 'CONFIRMED')}
                          >
                            Επιβεβαίωση
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleUpdateBookingStatus(booking._id, 'CANCELLED')}
                          >
                            Ακύρωση
                          </button>
                        </>
                      )}
                      {booking.status === 'CONFIRMED' && (
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleUpdateBookingStatus(booking._id, 'CANCELLED')}
                        >
                          Ακύρωση
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

export default AdminDashboard;
