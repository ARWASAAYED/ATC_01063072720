import api from "../utils/api";

// Service for handling payment-related operations
const PaymentService = {
  // Create a payment intent
  createPaymentIntent: async (bookingId, amount, currency = "usd") => {
    if (!bookingId) {
      throw new Error("Booking ID is required to create a payment intent");
    }
    try {
      const response = await api.post("/payments/create-intent", {
        bookingId,
        amount,
        currency,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating payment intent:", error);
      const message =
        error.response?.status === 400
          ? "Invalid payment amount or booking"
          : "Failed to create payment intent";
      throw new Error(message);
    }
  },

  // Process a payment
  processPayment: async (bookingId, paymentMethodId) => {
    try {
      const response = await api.post("/payments/process", {
        bookingId,
        paymentMethodId,
      });
      return response.data;
    } catch (error) {
      console.error("Error processing payment:", error);
      throw error;
    }
  },

  // Get payment details for a booking
  getPaymentStatus: async (bookingId) => {
    try {
      const response = await api.get(`/payments/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching payment status for booking ${bookingId}:`,
        error,
      );
      throw error;
    }
  },

  // Get payment configuration (public keys, etc.)
  getPaymentConfig: async () => {
    try {
      const response = await api.get("/payments/config");
      return response.data;
    } catch (error) {
      console.error("Error fetching payment configuration:", error);
      throw error;
    }
  },
};

export default PaymentService;
