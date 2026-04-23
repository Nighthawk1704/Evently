const mongoose = require('mongoose');

const ORDER_STATUSES = ['received', 'ready_for_shipping', 'out_for_delivery', 'cancelled'];
const PAYMENT_MODES = ['Cash', 'UPI'];

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, max: 1000 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], validate: v => v.length > 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMode: { type: String, enum: PAYMENT_MODES, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: 'received', index: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    number: { type: String, required: true, trim: true },
    notes: { type: String, trim: true, maxlength: 500, default: '' },
    statusHistory: [
      {
        status: { type: String, enum: ORDER_STATUSES },
        at: { type: Date, default: Date.now },
        _id: false,
      },
    ],
  },
  { timestamps: true, toJSON: { transform: (_d, ret) => { delete ret.__v; return ret; } } }
);

orderSchema.statics.STATUSES = ORDER_STATUSES;
orderSchema.statics.PAYMENT_MODES = PAYMENT_MODES;

module.exports = mongoose.model('Order', orderSchema);
