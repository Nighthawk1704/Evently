const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['user', 'vendor', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email'],
    },
    password: { type: String, required: true, minlength: 8, select: true },
    role: { type: String, enum: ROLES, required: true, index: true },
    phone: { type: String, trim: true, maxlength: 20 },

    // Vendor-only fields
    businessName: { type: String, trim: true, maxlength: 120 },
    category: {
      type: String,
      enum: ['Catering', 'Florist', 'Decoration', 'Lighting', null],
      default: null,
    },
    description: { type: String, trim: true, maxlength: 500 },

    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.statics.ROLES = ROLES;

module.exports = mongoose.model('User', userSchema);
