const mongoose = require('mongoose'); 
const Venue = require('../models/Venue');
const Event = require('../models/Event');
const { validationResult } = require('express-validator');

//  Get all venues

exports.getVenues = async (req, res) => {
  try {
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    let query = Venue.find(JSON.parse(queryStr));
    
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
    
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Venue.countDocuments(JSON.parse(queryStr));
    
    query = query.skip(startIndex).limit(limit);
    
    const venues = await query;
    
    const venuesWithEventCount = venues.map(venue => ({
      ...venue._doc,
      eventCount: venue.events.length
    }));
    
    res.status(200).json({
      success: true,
      count: venues.length,
      pagination: {
        next: endIndex < total ? { page: page + 1, limit } : null,
        prev: startIndex > 0 ? { page: page - 1, limit } : null
      },
      data: venuesWithEventCount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//  Get single venue

exports.getVenue = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: `No venue found with the id of ${req.params.id}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: { ...venue._doc, eventCount: venue.events.length }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//   Create new venue

exports.createVenue = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  
  try {
    console.log('Creating venue with body:', req.body);
    console.log('Uploaded file:', req.file);
    
    if (!req.user || !req.user.id) {
      console.log('No user found in request');
      return res.status(401).json({ success: false, message: 'Unauthorized: No user found' });
    }
    
    // Handle events
    let events = req.body.events;
    if (typeof events === 'string') {
      try {
        events = JSON.parse(events);
      } catch (err) {
        console.log('Invalid events format:', events);
        return res.status(400).json({ success: false, message: 'Invalid events format' });
      }
    }
    if (events && Array.isArray(events) && events.length > 0) {
      for (const eventId of events) {
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
          console.log('Invalid event ID:', eventId);
          return res.status(400).json({ success: false, message: `Invalid event ID: ${eventId}` });
        }
        const eventExists = await Event.findById(eventId);
        if (!eventExists) {
          console.log('Event not found:', eventId);
          return res.status(400).json({ success: false, message: `Event not found: ${eventId}` });
        }
      }
    } else {
      events = [];
    }
    
    // Handle amenities
    let amenities = req.body.amenities;
    if (typeof amenities === 'string') {
      try {
        amenities = JSON.parse(amenities);
      } catch (err) {
        console.log('Invalid amenities format:', amenities);
        return res.status(400).json({ success: false, message: 'Invalid amenities format' });
      }
    }
    if (!amenities || !Array.isArray(amenities)) {
      amenities = [];
    }
    
    // Handle image upload
    let imagePath = 'default-venue.jpg';
    if (req.file) {
      imagePath = `/Uploads/${req.file.filename}`;
      console.log('Image uploaded:', imagePath);
    }
    
 
    const venueData = {
      name: req.body.name,
      description: req.body.description,
      address: req.body.address,
      city: req.body.city,
      country: req.body.country,
      capacity: req.body.capacity,
      amenities,
      events,
      contactEmail: req.body.contactEmail,
      contactPhone: req.body.contactPhone,
      image: imagePath,
      createdBy: req.user.id
    };
    
    console.log('Venue data:', venueData);
    
    // Create venue
    const venue = await Venue.create(venueData);
    console.log('Venue created:', venue._id);
    
    res.status(201).json({
      success: true,
      data: venue
    });
  } catch (err) {
    console.error('Error creating venue:', err);
    if (err.message === 'Only JPEG, PNG, and GIF images are allowed') {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => ({
        msg: e.message,
        path: e.path
      }));
      return res.status(400).json({ success: false, errors });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

//   Update venue

exports.updateVenue = async (req, res) => {
  try {
    let venue = await Venue.findById(req.params.id);
    
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: `No venue found with the id of ${req.params.id}`
      });
    }
    
    // Handle events
    let events = req.body.events;
    if (typeof events === 'string') {
      try {
        events = JSON.parse(events);
      } catch (err) {
        console.log('Invalid events format:', events);
        return res.status(400).json({ success: false, message: 'Invalid events format' });
      }
    }
    if (events && Array.isArray(events) && events.length > 0) {
      for (const eventId of events) {
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
          console.log('Invalid event ID:', eventId);
          return res.status(400).json({ success: false, message: `Invalid event ID: ${eventId}` });
        }
        const eventExists = await Event.findById(eventId);
        if (!eventExists) {
          console.log('Event not found:', eventId);
          return res.status(400).json({ success: false, message: `Event not found: ${eventId}` });
        }
      }
    }
    
    // Handle amenities
    let amenities = req.body.amenities;
    if (typeof amenities === 'string') {
      try {
        amenities = JSON.parse(amenities);
      } catch (err) {
        console.log('Invalid amenities format:', amenities);
        return res.status(400).json({ success: false, message: 'Invalid amenities format' });
      }
    }
    
    const updateData = {
      ...req.body,
      events: events || venue.events,
      amenities: amenities || venue.amenities
    };
    
    if (req.file) {
      updateData.image = `/Uploads/${req.file.filename}`;
    }
    
    venue = await Venue.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: venue
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};


//   Delete venue

exports.deleteVenue = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: `No venue found with the id of ${req.params.id}`
      });
    }
    
    await venue.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}; 