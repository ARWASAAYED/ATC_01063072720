const express = require('express');
const { check } = require('express-validator');
const {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  cancelBooking
} = require('../controllers/bookingController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();


router.use(protect);


router.route('/')
  .get(getBookings)
  .post(
    [
      check('event', 'Event ID is required').not().isEmpty(),
      check('tickets', 'Tickets are required').isArray({ min: 1 }),
      check('totalAmount', 'Total amount is required').isNumeric(),
      check('paymentMethod', 'Payment method is required').not().isEmpty()
    ],
    createBooking
  );

router.route('/:id')
  .get(getBooking)
  .put(authorize('admin'), updateBooking);


router.route('/:id/cancel')
  .put(cancelBooking);

module.exports = router;
