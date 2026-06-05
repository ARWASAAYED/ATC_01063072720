const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Conference',
      'Seminar',
      'Workshop',
      'Concert',
      'Exhibition',
      'Sports',
      'Meetup',
      'Party',
      'Networking',
      'Other'
    ]
  },
  image: {
    type: String,
    default: 'default-event.jpg'
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  venue: {
    type: mongoose.Schema.ObjectId,
    ref: 'Venue',
    required: [true, 'Please add a venue']
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  city: {
    type: String,
    required: [true, 'Please add a city']
  },
  tickets: [
    {
      type: {
        type: String,
        required: [true, 'Please specify ticket type'],
        trim: true
      },
      price: {
        type: Number,
        required: [true, 'Please add a ticket price']
      },
      quantity: {
        type: Number,
        required: [true, 'Please add a ticket quantity']
      },
      available: {
        type: Number,
        required: [true, 'Please add available tickets']
      },
      description: {
        type: String
      }
    }
  ],
  organizer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  speakers: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Speaker'
    }
  ],
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', EventSchema);
