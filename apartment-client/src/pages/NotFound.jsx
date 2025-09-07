import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="not-found">
      <div className="container text-center py-5">
        <h1 className="display-1">404</h1>
        <h2>Η σελίδα δεν βρέθηκε</h2>
        <p className="lead">
          Η σελίδα που ψάχνετε δεν υπάρχει ή έχει μετακινηθεί.
        </p>
        <Link to="/" className="btn btn-primary">
          Επιστροφή στην Αρχική
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
