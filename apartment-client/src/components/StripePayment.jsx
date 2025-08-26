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

// Initialize Stripe (use test publishable key)
const stripePromise = loadStripe('pk_test_51234567890abcdef'); // Replace with your test key

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

    // Simulate payment intent confirmation (in real app, this would be done on backend)
    try {
      // Simulate successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onSuccess({
        paymentMethodId: paymentMethod.id,
        status: 'succeeded'
      });
    } catch (err) {
      onError('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
        type="submit"
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
    </form>
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
