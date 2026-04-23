const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema(
  {
    membershipNumber: { type: String, required: true, unique: true, index: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plan: {
      type: String,
      enum: ['6 months', '1 year', '2 years'],
      required: true,
      default: '6 months',
    },
    startedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['active', 'cancelled'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { transform: (_d, ret) => { delete ret.__v; return ret; } }
  }
);

module.exports = mongoose.model('Membership', membershipSchema);
