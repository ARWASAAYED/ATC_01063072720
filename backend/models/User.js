const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'organizer', 'admin'],
    default: 'user'
  },
  profileImage: {
    type: String,
    default: 'default-profile.jpg',
    match: [
      /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i,
      'Please provide a valid image URL'
    ]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});


UserSchema.index({ email: 1 }, { unique: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  try {
    const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});


UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '1h' 
    }
  );
};


UserSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (err) {
    throw new Error('Password comparison failed');
  }
};

// Method to check if token is expired
UserSchema.methods.isTokenExpired = function() {
  const token = this.getSignedJwtToken();
  const decoded = jwt.decode(token);
  if (!decoded) return true;
  return Date.now() >= decoded.exp * 1000;
};

module.exports = mongoose.model('User', UserSchema);