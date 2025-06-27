
// models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide your first name']
  },
  lastName: {
    type: String,
    required: [true, 'Please provide your last name']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    index: true // Add index for better performance
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  telephone: {
    type: String,
    unique: true, // NEW: Make telephone unique
    sparse: true, // Allow null values but ensure uniqueness when present
    index: true
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'superadmin'],
    default: 'admin'
  },
  departement: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  permissions: {
    type: [String],
    default: ['view']
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  avatar: {
    type: String,
    default: ''
  },
  lastLogin: {
    timestamp: Date,
    device: String,
    browser: String,
    location: String,
    ip: String
  }
});

// NEW: Add compound index to prevent duplicate full names in same department
userSchema.index({ firstName: 1, lastName: 1, departement: 1 }, { unique: true, sparse: true });

// Password hashing middleware
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(12);
    // Hash the password
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

// NEW: Custom validation for telephone format
userSchema.pre('save', function(next) {
  if (this.telephone) {
    // Clean and validate phone number format
    this.telephone = this.telephone.replace(/\s+/g, '').trim();
    
    // Basic phone validation (adjust regex as needed)
    const phoneRegex = /^(\+216|0)?[2-9][0-9]{7}$/;
    if (!phoneRegex.test(this.telephone)) {
      return next(new Error('Format de téléphone invalide'));
    }
  }
  next();
});

// Define the compare password method directly using bcrypt
userSchema.methods.comparePassword = async function(candidatePassword) {
  // Make sure both arguments are strings
  if (typeof candidatePassword !== 'string') {
    console.error('candidatePassword is not a string:', typeof candidatePassword);
    return false;
  }
  if (!this.password || typeof this.password !== 'string') {
    console.error('User password is missing or not a string');
    return false;
  }
  
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

// Password reset token generation
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
