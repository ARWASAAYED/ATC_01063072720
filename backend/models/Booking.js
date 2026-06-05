const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: true
  },
  tickets: [
    {
      ticketType: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
      },
      price: {
        type: Number,
        required: true
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'paypal', 'bank_transfer', 'other'],
    required: true
  },
  paymentId: {
    type: String
  },
  bookingStatus: {
    type: String,
    enum: ['confirmed', 'cancelled', 'pending'],
    default: 'pending'
  },
  bookingReference: {
    type: String,
    unique: true
  },
  attendeeInformation: {
    name: String,
    email: String,
    phone: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate booking reference number before saving
BookingSchema.pre('save', async function(next) {
  if (!this.bookingReference) {
    // Generate a unique booking reference (e.g., BK-1234567)
    this.bookingReference = 'BK-' + Math.floor(1000000 + Math.random() * 9000000);
  }
  next();
});

module.exports = mongoose.model('Booking', BookingSchema);
