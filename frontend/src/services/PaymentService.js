import api from '../utils/api';

// Service for handling payment-related operations
const PaymentService = {
  // Create a payment intent
  createPaymentIntent: async (amount, bookingId, currency = 'usd') => {
    try {
      const response = await api.post('/payments/create-payment-intent', {
        amount,
        bookingId,
        currency,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      const message =
        error.response?.status === 400
          ? 'Invalid payment amount or booking'
          : 'Failed to create payment intent';
      throw new Error(message);
    }
  },

  // Process a payment
  processPayment: async (bookingId, paymentMethodId) => {
    try {
      const response = await api.post('/payments/process', {
        bookingId,
        paymentMethodId
      });
      return response.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },

  // Get payment details for a booking
  getPaymentStatus: async (bookingId) => {
    try {
      const response = await api.get(`/payments/status/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching payment status for booking ${bookingId}:`, error);
      throw error;
    }
  },

  // Get payment configuration (public keys, etc.)
  getPaymentConfig: async () => {
    try {
      const response = await api.get('/payments/config');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment configuration:', error);
      throw error;
    }
  }
};

export default PaymentService;
