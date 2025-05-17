const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Venue = require('../models/Venue');
const Speaker = require('../models/Speaker');

exports.getEvents = async (req, res) => {
  try {
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    let query = Event.find(JSON.parse(queryStr)).populate([
      { path: 'venue', select: 'name city' },
      { path: 'organizer', select: 'name' },
      { path: 'speakers', select: 'name' }
    ]);
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
    const total = await Event.countDocuments(JSON.parse(queryStr));
    query = query.skip(startIndex).limit(limit);
    const events = await query;
    const pagination = {};
    if (endIndex < total) {
      pagination.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit };
    }
    res.status(200).json({
      success: true,
      count: events.length,
      pagination,
      data: events
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate([
      { path: 'venue', select: 'name address city country capacity' },
      { path: 'organizer', select: 'name email' },
      { path: 'speakers', select: 'name bio profileImage expertise company position' }
    ]);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: `No event found with the id of ${req.params.id}`
      });
    }
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.createEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    console.log('Creating event with body:', JSON.stringify(req.body, null, 2));
    console.log('Uploaded file:', req.file);

    // Validate venue
    if (!req.body.venue || !mongoose.Types.ObjectId.isValid(req.body.venue)) {
      console.log('Invalid venue ID:', req.body.venue);
      return res.status(400).json({ success: false, message: 'A valid venue ID is required' });
    }
    const venueExists = await Venue.findById(req.body.venue);
    if (!venueExists) {
      console.log('Venue not found:', req.body.venue);
      return res.status(400).json({ success: false, message: 'Venue not found' });
    }

    // Validate speakers
    let speakers = req.body.speakers;
    if (typeof speakers === 'string') {
      try {
        speakers = JSON.parse(speakers);
      } catch (err) {
        console.log('Invalid speakers format:', speakers);
        return res.status(400).json({ success: false, message: 'Invalid speakers format' });
      }
    }
    if (speakers && Array.isArray(speakers) && speakers.length > 0) {
      for (const speakerId of speakers) {
        if (!mongoose.Types.ObjectId.isValid(speakerId)) {
          console.log('Invalid speaker ID:', speakerId);
          return res.status(400).json({ success: false, message: `Invalid speaker ID: ${speakerId}` });
        }
        const speakerExists = await Speaker.findById(speakerId);
        if (!speakerExists) {
          console.log('Speaker not found:', speakerId);
          return res.status(400).json({ success: false, message: `Speaker not found: ${speakerId}` });
        }
      }
    } else {
      speakers = [];
    }

    // Validate tickets
    let tickets = req.body.tickets;
    console.log('Received tickets data:', tickets);
    
    if (typeof tickets === 'string') {
      try {
        tickets = JSON.parse(tickets);
        console.log('Parsed tickets from string:', tickets);
      } catch (err) {
        console.log('Error parsing tickets:', err);
        return res.status(400).json({ success: false, message: 'Invalid tickets format - could not parse JSON string' });
      }
    }
    
    if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
      console.log('No valid tickets found in request');
      return res.status(400).json({ success: false, message: 'At least one ticket is required' });
    }
    
    console.log('Validated tickets:', tickets);

    // Validate authentication
    if (!req.user || !req.user.id) {
      console.log('No user found in request');
      return res.status(401).json({ success: false, message: 'Unauthorized: No user found' });
    }

    // Handle image upload
    let imagePath = 'default-event.jpg';
    if (req.file) {
      // Create URL-friendly path for the image
      imagePath = `/uploads/${req.file.filename}`;
      console.log('Image uploaded:', imagePath);
    }

    // Create event data
    const eventData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      venue: req.body.venue,
      address: req.body.address,
      city: req.body.city,
      tickets,
      image: imagePath,
      speakers,
      isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true,
      organizer: req.user.id
    };

    console.log('Event data:', JSON.stringify(eventData, null, 2));

    // Create event
    const event = await Event.create(eventData);
    console.log('Event created:', event._id);

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (err) {
    console.error('Error creating event:', err);
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

exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: `No event found with the id of ${req.params.id}`
      });
    }
    if (
      event.organizer.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this event`
      });
    }
    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: `No event found with the id of ${req.params.id}`
      });
    }
    if (
      event.organizer.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this event`
      });
    }
    await event.deleteOne();
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