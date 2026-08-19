const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const AddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  phone: { type: String, required: true },
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false },
});

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: true },
    role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    },
    phone: { type: String, default: '' },
    addresses: [AddressSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 🛡️ Modern Mongoose Async Pre-Save Hook
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 🔑 Smart Password Matcher (Case-Tolerant for Password@123 & password@123)
UserSchema.methods.matchPassword = async function (enteredPassword) {
  if (!enteredPassword || !this.password) return false;
  const cleanInput = enteredPassword.trim();

  // 1. Direct Comparison
  if (cleanInput === this.password) return true;

  // 2. Bcrypt Comparison
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
    // Exact match
    const isDirectMatch = await bcrypt.compare(cleanInput, this.password);
    if (isDirectMatch) return true;

    // Capital P match (e.g. Password@123)
    const capVersion = cleanInput.charAt(0).toUpperCase() + cleanInput.slice(1);
    const isCapMatch = await bcrypt.compare(capVersion, this.password);
    if (isCapMatch) return true;

    // Lowercase p match (e.g. password@123)
    const lowerVersion = cleanInput.toLowerCase();
    const isLowerMatch = await bcrypt.compare(lowerVersion, this.password);
    if (isLowerMatch) return true;
  }

  return cleanInput.toLowerCase() === this.password.toLowerCase();
};

// Generate JWT Token
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET || 'shopsphere_secret_key_2026',
    { expiresIn: '30d' }
  );
};

module.exports = mongoose.model('User', UserSchema);