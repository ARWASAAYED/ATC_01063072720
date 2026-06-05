const express = require('express');
const {
  processPayment,
  getPaymentStatus,
  createPaymentIntent
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);


router.post('/process', processPayment);


router.get('/:bookingId', getPaymentStatus);

// Create payment intent route (for client-side confirmation)
router.post('/create-intent', createPaymentIntent);

module.exports = router;
