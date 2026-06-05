const express = require('express');
const upload = require('../middleware/multer');
const { check } = require('express-validator');
const {
  getVenues,
  getVenue,
  createVenue,
  updateVenue,
  deleteVenue
} = require('../controllers/venueController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getVenues)
  .post(
    protect,
    authorize('admin'),
    upload.single('image'),
    [
      check('name', 'Name is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('address', 'Address is required').not().isEmpty(),
      check('city', 'City is required').not().isEmpty(),
      check('country', 'Country is required').not().isEmpty(),
      check('capacity', 'Capacity must be at least 1').isInt({ min: 1 }),
      check('contactEmail').optional().isEmail().withMessage('Please provide a valid email'),
      check('contactPhone').optional().matches(/^\+?[\d\s-]{7,15}$/).withMessage('Please provide a valid phone number'),
      check('amenities').optional().custom((value) => {
        try {
          const amenities = typeof value === 'string' ? JSON.parse(value) : value;
          if (!Array.isArray(amenities)) throw new Error('Amenities must be an array');
          return true;
        } catch (err) {
          throw new Error('Invalid amenities format');
        }
      }),
    ],
    createVenue
  );

router.route('/:id')
  .get(getVenue)
  .put(protect, authorize('admin'), upload.single('image'), updateVenue)
  .delete(protect, authorize('admin'), deleteVenue);

module.exports = router;