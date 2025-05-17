const mongoose = require('mongoose');

const VenueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a venue name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  city: {
    type: String,
    required: [true, 'Please add a city']
  },
  country: {
    type: String,
    required: [true, 'Please add a country']
  },
  image: {
    type: String,
    default: 'default-venue.jpg'
  },
  events: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Event'
  }],
  capacity: {
    type: Number,
    required: [true, 'Please add the capacity']
  },
  amenities: {
    type: [String],
    default: []
  },
  contactEmail: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  contactPhone: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


VenueSchema.pre('find', function(next) {
  this.populate('events', 'title startDate category');
  next();
});
VenueSchema.pre('findOne', function(next) {
  this.populate('events', 'title startDate category');
  next();
});

module.exports = mongoose.model('Venue', VenueSchema);