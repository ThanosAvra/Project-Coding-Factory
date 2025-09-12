import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../api/axios';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { toast } from '../components/Toast';
import StripePayment from '../components/StripePayment';

export default function Payment() {
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: '',
    paymentMethod: 'stripe'
  });
  const [processing, setProcessing] = useState(false);
  const [mockPayment, setMockPayment] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get booking data from navigation state or sessionStorage (fallback for refresh/direct access)
  const bookingInfo = (() => {
    const fromState = location.state?.bookingInfo;
    if (fromState) return fromState;
    try {
      const stored = sessionStorage.getItem('bookingInfo');
      return stored ? JSON.parse(stored) : null;
    } catch (_) {
      return null;
    }
  })();

  if (!bookingInfo) {
    return (
      <div className="text-center" style={{ padding: '3rem' }}>
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div className="card-body">
            <h2>❌ Σφάλμα</h2>
            <p>Δεν βρέθηκαν στοιχεία κράτησης</p>
            <button onClick={() => navigate('/')} className="btn btn-primary">
              Επιστροφή στην Αρχική
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formatted.replace(/\s/g, '').length <= 16) {
        setPaymentData(prev => ({ ...prev, [name]: formatted }));
      }
      return;
    }
    
    // Format expiry date
    if (name === 'expiryDate') {
      const formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      if (formatted.length <= 5) {
        setPaymentData(prev => ({ ...prev, [name]: formatted }));
      }
      return;
    }
    
    // Limit CVV to 3 digits
    if (name === 'cvv') {
      const formatted = value.replace(/\D/g, '');
      if (formatted.length <= 3) {
        setPaymentData(prev => ({ ...prev, [name]: formatted }));
      }
      return;
    }
    
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    try { sessionStorage.removeItem('bookingInfo'); } catch (_) {}
    navigate(-1);
  };

  const handleStripeSuccess = async (paymentResult) => {
    setProcessing(true);
    
    try {
      // Set check-in time to 15:00 and check-out time to 11:00
      const startDate = new Date(bookingInfo.startDate);
      startDate.setHours(15, 0, 0, 0); // 15:00 check-in
      
      const endDate = new Date(bookingInfo.endDate);
      endDate.setHours(11, 0, 0, 0); // 11:00 check-out

      // Create the booking with COMPLETED payment status since payment succeeded
      const bookingData = {
        apartmentId: bookingInfo.apartmentId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalPrice: bookingInfo.totalPrice,
        paymentMethod: 'stripe',
        paymentMethodId: paymentResult.paymentMethodId,
        paymentIntentId: paymentResult.paymentIntentId,
        paymentStatus: 'COMPLETED', // Payment is already completed
        status: 'CONFIRMED', // Booking is confirmed after successful payment
        guestName: bookingInfo.guestName || '',
        guestEmail: bookingInfo.guestEmail || '',
        guestPhone: bookingInfo.guestPhone || ''
      };

      // Create the booking - it will be automatically confirmed due to COMPLETED payment
      const bookingResponse = await axios.post('/bookings', bookingData);
      
      // Show success message
      toast.success('🎉 Πληρωμή επιτυχής! Η κράτησή σας επιβεβαιώθηκε!');
      
      // Clear stored booking info on success
      try { 
        sessionStorage.removeItem('bookingInfo'); 
      } catch (_) {}

      // Redirect to bookings page after a short delay
      setTimeout(() => {
        navigate('/my-bookings', { 
          state: { bookingConfirmed: true },
          replace: true // Replace current entry in history
        });
      }, 1500);
      
    } catch (err) {
      console.error('Booking creation error:', err);
      toast.error(err.response?.data?.error || 'Σφάλμα κατά τη δημιουργία κράτησης');
    } finally {
      setProcessing(false);
    }
  };

  const handleStripeError = (error) => {
    toast.error(`Σφάλμα πληρωμής: ${error}`);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv || !paymentData.cardHolder) {
      toast.warning('Παρακαλώ συμπληρώστε όλα τα στοιχεία της κάρτας');
      return;
    }

    setProcessing(true);

    try {
      // Set check-in time to 15:00 and check-out time to 11:00
      const startDate = new Date(bookingInfo.startDate);
      startDate.setHours(15, 0, 0, 0); // 15:00 check-in
      
      const endDate = new Date(bookingInfo.endDate);
      endDate.setHours(11, 0, 0, 0); // 11:00 check-out

      // Create booking with payment info
      const bookingData = {
        apartmentId: bookingInfo.apartmentId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalPrice: bookingInfo.totalPrice,
        paymentMethod: paymentData.paymentMethod,
        paymentStatus: 'COMPLETED',
        paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        notes: 'Πληρωμή μέσω πιστωτικής κάρτας'
      };

      // Create and confirm booking in a single request
      const response = await axios.post('/bookings', bookingData);
      
      toast.success('🎉 Πληρωμή επιτυχής! Η κράτησή σας επιβεβαιώθηκε!');
      
      // Clear stored booking info on success
      try { 
        sessionStorage.removeItem('bookingInfo'); 
        localStorage.removeItem('bookingInfo');
      } catch (_) {}
      
      // Redirect to my bookings after a short delay
      setTimeout(() => {
        navigate('/my-bookings', { 
          state: { 
            bookingConfirmed: true,
            bookingId: response.data._id 
          } 
        });
      }, 1500);
      
    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = err.response?.data?.error || 'Σφάλμα κατά την πληρωμή';
      toast.error(errorMessage);
      
      // If booking was created but confirmation failed, show specific message
      if (err.response?.data?.bookingId) {
        toast.warning('Η πληρωμή ολοκληρώθηκε αλλά υπήρξε πρόβλημα με την επιβεβαίωση. Παρακαλώ ελέγξτε τις κρατήσεις σας.');
        navigate('/my-bookings');
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleMockPayment = async () => {
    try {
      setProcessing(true);
      
      const token = localStorage.getItem('token');
      
      // Set check-in time to 15:00 and check-out time to 11:00
      const startDate = new Date(bookingInfo.startDate);
      startDate.setHours(15, 0, 0, 0); // 15:00 check-in
      
      const endDate = new Date(bookingInfo.endDate);
      endDate.setHours(11, 0, 0, 0); // 11:00 check-out
      
      const bookingData = {
        apartment: bookingInfo.apartmentId, // Changed from apartmentId to apartment to match backend
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalPrice: bookingInfo.totalPrice,
        paymentStatus: 'COMPLETED',
        status: 'CONFIRMED',
        paymentMethod: 'mock',
        paymentDate: new Date().toISOString()
      };

      
      // Use the full URL for the request
      const response = await axios.post(
        'http://localhost:8080/api/bookings',
        bookingData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      toast.success('Η κράτηση ολοκληρώθηκε επιτυχώς!');
      
      // Clear any stored booking info
      sessionStorage.removeItem('bookingInfo');
      
      // Redirect to bookings page
      navigate('/my-bookings');
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      // Log the specific error message from backend
      if (error.response?.data) {
        console.error('Backend error response:', JSON.stringify(error.response.data, null, 2));
      }
      
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Σφάλμα κατά την ολοκλήρωση της κράτησης';
      
      toast.error(`Σφάλμα: ${errorMessage}`);
      
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        navigate('/login', { state: { from: location.pathname } });
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="text-center mb-4">
        <h1 style={{ 
          background: 'var(--success-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          💳 Πληρωμή Κράτησης
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Ολοκληρώστε την πληρωμή για να επιβεβαιώσετε την κράτησή σας
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Booking Summary */}
        <div className="card">
          <div className="card-header">
            <h3>📋 Σύνοψη Κράτησης</h3>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: '1rem' }}>
              <strong>🏠 Διαμέρισμα:</strong>
              <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)' }}>
                {bookingInfo.apartmentTitle}
              </p>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong>📍 Τοποθεσία:</strong>
              <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)' }}>
                {bookingInfo.apartmentLocation}
              </p>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong>📅 Ημερομηνίες:</strong>
              <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)' }}>
                {new Date(bookingInfo.startDate).toLocaleDateString('el-GR')} - 
                {new Date(bookingInfo.endDate).toLocaleDateString('el-GR')}
              </p>
            </div>
            
            <div style={{ 
              background: 'var(--success-gradient)',
              color: 'white',
              padding: '1rem',
              borderRadius: 'var(--border-radius)',
              textAlign: 'center',
              marginTop: '1.5rem'
            }}>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Συνολικό Κόστος</div>
              <div style={{ fontSize: '2rem', fontWeight: '700' }}>
                💰 {bookingInfo.totalPrice}€
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="card">
          <div className="card-header">
            <h3>💳 Στοιχεία Πληρωμής</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handlePayment}>
              
              {/* Payment Method Selection */}
              <div className="form-group">
                <label className="form-label">Τρόπος Πληρωμής</label>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="stripe"
                      checked={paymentData.paymentMethod === 'stripe'}
                      onChange={handleInputChange}
                    />
                    💳 Stripe
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentData.paymentMethod === 'card'}
                      onChange={handleInputChange}
                    />
                    🏦 Manual Card
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentData.paymentMethod === 'paypal'}
                      onChange={handleInputChange}
                    />
                    🅿️ PayPal
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="mock"
                      checked={paymentData.paymentMethod === 'mock'}
                      onChange={handleInputChange}
                    />
                    🤖 Mock Payment
                  </label>
                </div>
              </div>

              {paymentData.paymentMethod === 'stripe' && (
                <StripePayment 
                  amount={bookingInfo.totalPrice}
                  onSuccess={handleStripeSuccess}
                  onError={handleStripeError}
                />
              )}

              {paymentData.paymentMethod === 'card' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Όνομα Κατόχου Κάρτας</label>
                    <input
                      type="text"
                      name="cardHolder"
                      className="form-input"
                      value={paymentData.cardHolder}
                      onChange={handleInputChange}
                      placeholder="π.χ. ΘΑΝΟΣ ΑΒΡΑΜΙΔΗΣ"
                      disabled={processing}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Αριθμός Κάρτας</label>
                    <input
                      type="text"
                      name="cardNumber"
                      className="form-input"
                      value={paymentData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      disabled={processing}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Ημ. Λήξης</label>
                      <input
                        type="text"
                        name="expiryDate"
                        className="form-input"
                        value={paymentData.expiryDate}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        disabled={processing}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">CVV</label>
                      <input
                        type="text"
                        name="cvv"
                        className="form-input"
                        value={paymentData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        disabled={processing}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {paymentData.paymentMethod === 'paypal' && (
                <div style={{ 
                  background: '#f8f9fa',
                  padding: '2rem',
                  borderRadius: 'var(--border-radius)',
                  textAlign: 'center',
                  border: '2px dashed var(--border-color)'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🅿️</div>
                  <p>Θα ανακατευθυνθείτε στο PayPal για την ολοκλήρωση της πληρωμής</p>
                </div>
              )}

              {paymentData.paymentMethod === 'mock' && (
                <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <h3 className="font-bold mb-2">Λειτουργία Δοκιμής (Χωρίς Stripe)</h3>
                  <p className="mb-3 text-sm">Για δοκιμαστικούς σκοπούς, μπορείτε να χρησιμοποιήσετε την παρακάτω λειτουργία χωρίς πραγματική χρέωση.</p>
                  <button
                    onClick={handleMockPayment}
                    disabled={processing}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
                  >
                    {processing ? 'Επεξεργασία...' : 'Ολοκλήρωση Κράτησης (Δοκιμαστική Λειτουργία)'}
                  </button>
                </div>
              )}

              {paymentData.paymentMethod !== 'stripe' && paymentData.paymentMethod !== 'mock' && (
                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  justifyContent: 'flex-end',
                  marginTop: '2rem'
                }}>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-outline"
                    disabled={processing}
                  >
                    ❌ Ακύρωση
                  </button>
                  
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={processing}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem'
                    }}
                  >
                    {processing ? (
                      <>
                        <LoadingSpinner size="sm" color="white" />
                        Επεξεργασία...
                      </>
                    ) : (
                      <>
                        <span>💳</span>
                        Πληρωμή {bookingInfo.totalPrice}€
                      </>
                    )}
                  </button>
                </div>
              )}

              {paymentData.paymentMethod === 'stripe' && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-start',
                  marginTop: '1rem'
                }}>
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="btn btn-outline"
                    disabled={processing}
                  >
                    ❌ Ακύρωση
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="card" style={{ marginTop: '2rem', background: 'var(--info-gradient)', color: 'white' }}>
        <div className="card-body">
          <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🔒 Ασφάλεια Πληρωμών
          </h4>
          <p style={{ margin: 0, opacity: 0.9 }}>
            <strong>Demo Mode:</strong> Δεν πραγματοποιούνται πραγματικές χρεώσεις.<br/>
            <strong>Stripe Test:</strong> Χρησιμοποιήστε 4242 4242 4242 4242 για επιτυχή πληρωμή.<br/>
            <strong>Manual Card:</strong> Οποιαδήποτε στοιχεία για δοκιμή.
          </p>
        </div>
      </div>
    </div>
  );
}
