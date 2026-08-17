const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter your full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please enter an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please enter a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Don't return password in query results
    },
    role: {
      type: String,
      enum: ['customer', 'vendor', 'admin'],
      default: 'customer',
    },
    avatar: {
      type: String,
      default: 'https://ik.imagekit.io/shopspheredemo/default-avatar.png',
    },
    phone: {
      type: String,
      default: '',
    },
    addresses: [
      {
        fullName: String,
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: { type: String, default: 'India' },
        phone: String,
        isDefault: { type: Boolean, default: false },
      },
    ],
    vendorProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Encrypt password using bcrypt before saving to MongoDB
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate signed JWT Token
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role, email: this.email },
    process.env.JWT_SECRET || 'shopsphere_fallback_secret_key',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

module.exports = mongoose.model('User', UserSchema);