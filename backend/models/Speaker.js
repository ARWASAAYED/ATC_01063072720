const mongoose = require('mongoose');

const SpeakerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  bio: {
    type: String,
    required: [true, 'Please add a biography']
  },
  profileImage: {
    type: String,
    default: 'default-speaker.jpg'
  },
  expertise: {
    type: [String],
    required: [true, 'Please add areas of expertise']
  },
  company: {
    type: String
  },
  position: {
    type: String
  },
  socialMedia: {
    twitter: String,
    linkedin: String,
    facebook: String,
    instagram: String
  },
  events: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Event'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Speaker', SpeakerSchema);
