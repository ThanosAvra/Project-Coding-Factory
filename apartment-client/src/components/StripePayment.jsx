import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { LoadingSpinner } from './LoadingSpinner';
import { toast } from './Toast';

// Initialize Stripe with publishable key from environment variables
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#424770',
      fontFamily: '"Inter", sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
      iconColor: '#9e2146',
    },
  },
  hidePostalCode: true,
};

function CheckoutForm({ amount, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const card = elements.getElement(CardElement);

    // Create payment method
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: card,
    });

    if (error) {
      console.error('Payment method error:', error);
      onError(error.message);
      setProcessing(false);
      return;
    }

    try {
      // Call your backend to create a payment intent
      const response = await axios.post('/api/payments/create-payment-intent', {
        paymentMethodId: paymentMethod.id,
        amount: amount * 100, // Convert to cents
        currency: 'eur',
        metadata: {
          apartmentId: bookingInfo.apartmentId,
          startDate: bookingInfo.startDate,
          endDate: bookingInfo.endDate,
          totalPrice: amount
        }
      });
      
      // Confirm the payment on the client
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        response.data.clientSecret
      );
      
      if (confirmError) {
        throw confirmError;
      }
      
      if (paymentIntent.status === 'succeeded') {
        onSuccess({
          paymentMethodId: paymentMethod.id,
          paymentIntentId: paymentIntent.id,
          status: 'succeeded'
        });
      }
    } catch (err) {
      onError('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <div style={{ 
        padding: '1rem',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius)',
        marginBottom: '1rem',
        background: 'white'
      }}>
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>
      
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!stripe || processing}
        className="btn btn-success"
        style={{ 
          width: '100%',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '0.5rem'
        }}
      >
        {processing ? (
          <>
            <LoadingSpinner size="sm" color="white" />
            Processing...
          </>
        ) : (
          <>
            <span>💳</span>
            Pay €{amount}
          </>
        )}
      </button>
      
      <div style={{ 
        marginTop: '1rem',
        padding: '0.75rem',
        background: '#f8f9fa',
        borderRadius: 'var(--border-radius-sm)',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)'
      }}>
        <strong>Test Card Numbers:</strong><br/>
        Success: 4242 4242 4242 4242<br/>
        Declined: 4000 0000 0000 0002<br/>
        Use any future date and any 3-digit CVC
      </div>
    </div>
  );
}

export default function StripePayment({ amount, onSuccess, onError }) {
  return (
    <Elements stripe={stripePromise}>
      <div>
        <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>💳</span>
          Stripe Payment
        </h4>
        <CheckoutForm 
          amount={amount} 
          onSuccess={onSuccess} 
          onError={onError} 
        />
      </div>
    </Elements>
  );
}
