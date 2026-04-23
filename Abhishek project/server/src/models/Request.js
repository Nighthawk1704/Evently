const mongoose = require('mongoose');

const REQUEST_STATUSES = ['pending', 'accepted', 'rejected'];

const requestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    details: { type: String, required: true, trim: true, maxlength: 1000 },
    budget: { type: Number, min: 0 },
    eventDate: { type: Date, required: true },
    status: { type: String, enum: REQUEST_STATUSES, default: 'pending', index: true },
    vendorResponse: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { timestamps: true, toJSON: { transform: (_d, ret) => { delete ret.__v; return ret; } } }
);

requestSchema.statics.STATUSES = REQUEST_STATUSES;

module.exports = mongoose.model('Request', requestSchema);
