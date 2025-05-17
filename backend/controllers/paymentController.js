const Booking = require('../models/Booking');
const Event = require('../models/Event');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'mock_key'); 

//  Process payment

exports.processPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethodId } = req.body;

    // Fetch booking details
    const booking = await Booking.findById(bookingId).populate('event');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify user is booking owner
    if (booking.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to process this payment'
      });
    }

    // Check if booking is already paid
    if (booking.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already paid for'
      });
    }

    if (process.env.BYPASS_STRIPE === 'true') {
      // Mock payment intent response
      const mockPaymentIntent = {
        id: `pi_mock_${Date.now()}`,
        amount: Math.round(booking.totalAmount * 100),
        currency: 'usd',
        status: 'succeeded',
        payment_method_details: { card: { last4: '4242' } },
        created: Math.floor(Date.now() / 1000),
        description: `Booking for ${booking.event.title}`,
        metadata: {
          booking_id: booking._id.toString(),
          event_id: booking.event._id.toString(),
          user_id: req.user.id
        }
      };

      // Update booking
      booking.paymentStatus = 'completed';
      booking.bookingStatus = 'confirmed';
      booking.paymentId = mockPaymentIntent.id;
      await booking.save();

      return res.status(200).json({
        success: true,
        message: 'Payment successful (mocked)',
        data: {
          booking,
          paymentIntent: mockPaymentIntent
        }
      });
    }

    // Real Stripe logic
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalAmount * 100),
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      description: `Booking for ${booking.event.title}`,
      metadata: {
        booking_id: booking._id.toString(),
        event_id: booking.event._id.toString(),
        user_id: req.user.id
      }
    });

    if (paymentIntent.status === 'succeeded') {
      booking.paymentStatus = 'completed';
      booking.bookingStatus = 'confirmed';
      booking.paymentId = paymentIntent.id;
      await booking.save();

      res.status(200).json({
        success: true,
        message: 'Payment successful',
        data: {
          booking,
          paymentIntent
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment failed',
        data: paymentIntent
      });
    }
  } catch (error) {
    console.error(error);
    if (process.env.BYPASS_STRIPE === 'true') {
      return res.status(500).json({
        success: false,
        message: 'Server error during mock payment processing'
      });
    }
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during payment processing'
    });
  }
};

//    Get payment status

exports.getPaymentStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view this payment'
      });
    }

    if (process.env.BYPASS_STRIPE === 'true' && booking.paymentId) {
      // Mock payment details
      const mockPaymentIntent = {
        id: booking.paymentId,
        amount: Math.round(booking.totalAmount * 100),
        currency: 'usd',
        status: 'succeeded',
        payment_method_details: { card: { last4: '4242' } },
        created: Math.floor(Date.now() / 1000)
      };

      return res.status(200).json({
        success: true,
        data: {
          bookingStatus: booking.bookingStatus,
          paymentStatus: booking.paymentStatus,
          paymentDetails: mockPaymentIntent
        }
      });
    }

    if (booking.paymentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(booking.paymentId);

      res.status(200).json({
        success: true,
        data: {
          bookingStatus: booking.bookingStatus,
          paymentStatus: booking.paymentStatus,
          paymentDetails: paymentIntent
        }
      });
    } else {
      res.status(200).json({
        success: true,
        data: {
          bookingStatus: booking.bookingStatus,
          paymentStatus: booking.paymentStatus
        }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//   Create payment intent

exports.createPaymentIntent = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate('event');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to process this payment'
      });
    }

    if (process.env.BYPASS_STRIPE === 'true') {
      return res.status(200).json({
        success: true,
        clientSecret: `mock_client_secret_${Date.now()}`
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalAmount * 100),
      currency: 'usd',
      metadata: {
        booking_id: booking._id.toString(),
        event_id: booking.event._id.toString(),
        user_id: req.user.id
      }
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};