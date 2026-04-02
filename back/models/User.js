// back/models/User.js
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, trim: true, lowercase: true, default: '' },
  phone:    { type: String, trim: true, default: '' },
  city:     { type: String, required: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },

  // FIX: googleId field was missing — Google OAuth route tries to save it,
  // causing "Unrecognized field" error when a user signs in with Google.
  googleId: { type: String, default: '' },
}, { timestamps: true });

// Sparse unique indexes — allows multiple empty-string values but enforces
// uniqueness for non-empty emails and phones
userSchema.index(
  { email: 1 },
  { sparse: true, partialFilterExpression: { email: { $gt: '' } } }
);
userSchema.index(
  { phone: 1 },
  { sparse: true, partialFilterExpression: { phone: { $gt: '' } } }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt    = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
