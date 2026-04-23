const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    category: {
      type: String,
      enum: ['Catering', 'Florist', 'Decoration', 'Lighting'],
      required: true,
      index: true,
    },
    price: { type: Number, required: true, min: 0 },
    unit: {
      type: String,
      enum: ['per_event', 'per_person', 'per_hour', 'per_day'],
      default: 'per_event',
    },
    imageUrl: { type: String, trim: true, default: '' },
    isAvailable: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, toJSON: { transform: (_d, ret) => { delete ret.__v; return ret; } } }
);

productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
