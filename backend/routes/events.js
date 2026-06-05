
const express = require('express');
const upload = require('../middleware/multer');
const { check } = require('express-validator');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();


router.get('/', getEvents);

// Create new event with image upload
router.post(
  '/',
  protect,
  authorize('organizer', 'admin'),
  upload.single('image'), 
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('category', 'Category is required').not().isEmpty(),
    check('startDate', 'Start date is required').not().isEmpty(),
    check('endDate', 'End date is required').not().isEmpty(),
    check('venue', 'Venue is required').not().isEmpty(),
    check('address', 'Address is required').not().isEmpty(),
    check('city', 'City is required').not().isEmpty(),
  ],
  createEvent
);

// Get, update and delete single event
router.route('/:id')
  .get(getEvent)
  .put(protect, authorize('organizer', 'admin'), upload.single('image'), updateEvent)
  .delete(protect, authorize('organizer', 'admin'), deleteEvent);

module.exports = router;