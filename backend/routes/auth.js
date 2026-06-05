const express = require('express');
const { check } = require('express-validator');
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  [
    check('name', 'Name is required').trim().notEmpty(),
    check('email', 'Please include a valid email').trim().isEmail().normalizeEmail(),
    check('password', 'Password must be at least 6 characters').trim().isLength({ min: 6 }),
    check('role', 'Role must be either admin or user').optional().isIn(['admin', 'user'])
  ],
  register
);

// Login user
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').trim().isEmail().normalizeEmail(),
    check('password', 'Password is required').trim().exists()
  ],
  login
);

router.get('/me', protect, [
  check('role', 'Only admins can access this route').custom((value, { req }) => {
    if (req.user.role !== 'admin') {
      throw new Error('Unauthorized access');
    }
    return true;
  })
], getMe);


router.put('/updatedetails', protect, [
  check('role', 'Only admins can update details').custom((value, { req }) => {
    if (req.user.role !== 'admin') {
      throw new Error('Unauthorized access');
    }
    return true;
  }),
  check('name', 'Name is required').optional().trim().notEmpty(),
  check('email', 'Please include a valid email').optional().trim().isEmail().normalizeEmail()
], updateDetails);

// Update password (admin-only access)
router.put(
  '/updatepassword',
  [
    check('role', 'Only admins can update password').custom((value, { req }) => {
      if (req.user.role !== 'admin') {
        throw new Error('Unauthorized access');
      }
      return true;
    }),
    check('currentPassword', 'Current password is required').trim().exists(),
    check('newPassword', 'New password must be at least 6 characters').trim().isLength({ min: 6 })
  ],
  protect,
  updatePassword
);

module.exports = router;