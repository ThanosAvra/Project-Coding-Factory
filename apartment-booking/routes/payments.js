const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { createPaymentIntent } = require('../config/stripe');

// Create payment intent
router.post('/create-payment-intent', auth(), async (req, res) => {
  try {
    const { amount, paymentMethodId, metadata } = req.body;
    
    if (!amount || !paymentMethodId) {
      return res.status(400).json({ error: 'Amount and payment method ID are required' });
    }

    const result = await createPaymentIntent(
      amount,
      'eur',
      {
        ...metadata,
        userId: req.user.id,
        email: req.user.email
      }
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ error: 'Error creating payment intent' });
  }
});

module.exports = router;
