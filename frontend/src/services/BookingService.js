import { bookingAPI } from '../utils/api';

// Service for handling booking-related operations
const BookingService = {
  // Get user's bookings
  getUserBookings: async () => {
    try {
      const response = await bookingAPI.getBookings();
      return response;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
  },

  // Get booking by ID
  getBookingById: async (bookingId) => {
    try {
      const response = await bookingAPI.getBooking(bookingId);
      return response;
    } catch (error) {
      console.error(`Error fetching booking with ID ${bookingId}:`, error);
      throw error;
    }
  },

  // Create a new booking
  createBooking: async (bookingData) => {
    try {
      const response = await bookingAPI.createBooking(bookingData);
      return response;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  // Cancel a booking
  cancelBooking: async (bookingId) => {
    try {
      const response = await bookingAPI.cancelBooking(bookingId);
      return response;
    } catch (error) {
      console.error(`Error cancelling booking with ID ${bookingId}:`, error);
      throw error;
    }
  },

  // Get bookings by status (admin only)
  getBookingsByStatus: async (status) => {
    try {
      const response = await bookingAPI.getBookings(`?bookingStatus=${status}`);
      return response;
    } catch (error) {
      console.error(`Error fetching bookings with status ${status}:`, error);
      throw error;
    }
  },

  // Get bookings by event (admin only)
  getBookingsByEvent: async (eventId) => {
    try {
      const response = await bookingAPI.getBookings(`?event=${eventId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching bookings for event ${eventId}:`, error);
      throw error;
    }
  }
};

export default BookingService;
