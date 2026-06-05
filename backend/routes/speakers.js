const express = require('express');
const { check } = require('express-validator');
const {
  getSpeakers,
  getSpeaker,
  createSpeaker,
  updateSpeaker,
  deleteSpeaker
} = require('../controllers/speakerController');
const upload = require('../middleware/multer');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all speakers and create new speaker
router.route('/')
  .get(getSpeakers)
  .post(
    protect,
    authorize('admin', 'organizer'),
    upload.single('image'),
    [
      check('name', 'Name is required').not().isEmpty(),
      check('bio', 'Biography is required').not().isEmpty(),
      check('expertise')
        .custom((value) => {
          if (typeof value === 'string') {
            try {
              const parsed = JSON.parse(value);
              if (!Array.isArray(parsed) || parsed.length < 1) {
                throw new Error('Areas of expertise must be a non-empty array');
              }
              return true;
            } catch (err) {
              throw new Error('Invalid expertise format');
            }
          }
          throw new Error('Areas of expertise must be provided as a JSON string');
        })
    ],
    createSpeaker
  );

// Get, update and delete single speaker
router.route('/:id')
  .get(getSpeaker)
  .put(protect, authorize('admin', 'organizer'), upload.single('image'), updateSpeaker)
  .delete(protect, authorize('admin'), deleteSpeaker);

module.exports = router;