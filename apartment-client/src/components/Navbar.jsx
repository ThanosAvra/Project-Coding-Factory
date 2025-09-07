import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function Navbar() {
  const { user, logout } = useUser();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="logo">
          Apartment Booking
        </Link>
      </div>
      
      <div className="navbar-links">
        <Link to="/" className="nav-link">
          Αρχική
        </Link>
        
        {user && (
          <>
            <Link to="/my-bookings" className="nav-link">
              Οι Κρατήσεις μου
            </Link>
            
            {user.role === 'admin' && (
              <Link to="/admin" className="nav-link">
                Διαχείριση
              </Link>
            )}
            
            <button onClick={logout} className="btn btn-link">
              Αποσύνδεση
            </button>
          </>
        )}
        
        {!user && (
          <>
            <Link to="/login" className="nav-link">
              Σύνδεση
            </Link>
            <Link to="/register" className="btn btn-primary">
              Εγγραφή
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
