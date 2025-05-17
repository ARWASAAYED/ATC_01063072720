const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { validationResult } = require('express-validator');

//   Get all bookings

exports.getBookings = async (req, res) => {
  try {
    let query;

    
    if (req.user.role === 'admin') {
      query = Booking.find().populate({
        path: 'event',
        select: 'title startDate'
      }).populate({
        path: 'user',
        select: 'name email'
      });
    } else {
     
      query = Booking.find({ user: req.user.id }).populate({
        path: 'event',
        select: 'title startDate'
      });
    }

    const bookings = await query;

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//    Get single booking

exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'event',
        select: 'title description startDate endDate venue'
      })
      .populate({
        path: 'user',
        select: 'name email'
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking found with the id of ${req.params.id}`
      });
    }

    // Make sure user is booking owner or admin
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//    Create new booking

exports.createBooking = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { event, tickets, totalAmount, paymentMethod, attendeeInformation } = req.body;

  try {
    // Check if event exists
    const eventExists = await Event.findById(event);
    if (!eventExists) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if there are enough tickets available
    for (const ticket of tickets) {
      const eventTicket = eventExists.tickets.find(t => t.type === ticket.ticketType);
      if (!eventTicket) {
        return res.status(400).json({
          success: false,
          message: `Ticket type ${ticket.ticketType} not found`
        });
      }

      if (eventTicket.available < ticket.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough ${ticket.ticketType} tickets available`
        });
      }
    }

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      event,
      tickets,
      totalAmount,
      paymentMethod,
      attendeeInformation
    });

    // Update ticket availability
    for (const ticket of tickets) {
      const eventTicket = eventExists.tickets.find(t => t.type === ticket.ticketType);
      eventTicket.available -= ticket.quantity;
    }
    await eventExists.save();

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//    Update booking

exports.updateBooking = async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking found with the id of ${req.params.id}`
      });
    }

    // Make sure user is admin
    if (req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//    Cancel booking

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking found with the id of ${req.params.id}`
      });
    }

    // Make sure user is booking owner or admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Check if booking is already cancelled
    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already cancelled'
      });
    }

    booking.bookingStatus = 'cancelled';
    await booking.save();

    
    const event = await Event.findById(booking.event);
    if (event) {
      for (const ticket of booking.tickets) {
        const eventTicket = event.tickets.find(t => t.type === ticket.ticketType);
        if (eventTicket) {
          eventTicket.available += ticket.quantity;
        }
      }
      await event.save();
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
