const express = require('express');
const mongoose = require('mongoose');
const { body, param } = require('express-validator');

const Order = require('../models/Order');
const Product = require('../models/Product');
const { requireAuth } = require('../middleware/requireAuth');
const { requireRole } = require('../middleware/requireRole');
const { handleValidation } = require('../middleware/handleValidation');
const { asyncHandler } = require('../middleware/errorHandler');
const { canTransition, nextAllowed } = require('../lib/orderState');

const router = express.Router();

// ---- POST /api/orders  (user only) ----
router.post(
  '/',
  requireAuth,
  requireRole('user'),
  [
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.product').custom(v => mongoose.isValidObjectId(v)).withMessage('Invalid product id'),
    body('items.*.quantity').isInt({ min: 1, max: 1000 }).toInt(),
    body('paymentMode').isIn(['Cash', 'UPI']).withMessage('paymentMode must be Cash or UPI'),
    body('customerName').trim().isLength({ min: 2 }).withMessage('Name is required'),
    body('customerEmail').isEmail().withMessage('Invalid email'),
    body('address').trim().isLength({ min: 5 }).withMessage('Address is required'),
    body('city').trim().isLength({ min: 2 }).withMessage('City is required'),
    body('state').trim().isLength({ min: 2 }).withMessage('State is required'),
    body('pincode').trim().isLength({ min: 6 }).withMessage('Pincode is required'),
    body('number').trim().isLength({ min: 10 }).withMessage('Number is required'),
    body('notes').optional().trim().isLength({ max: 500 }),
  ],
  handleValidation,
  asyncHandler(async (req, res) => {
    const { items, paymentMode, customerName, customerEmail, address, city, state, pincode, number, notes } = req.body;

    // Load products, verify all exist, belong to the same vendor, and are available.
    const productIds = items.map(i => i.product);
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    if (products.length !== productIds.length) {
      return res.status(400).json({ error: 'One or more products not found' });
    }
    if (products.some(p => !p.isAvailable)) {
      return res.status(400).json({ error: 'One or more products are unavailable' });
    }

    const vendorIds = new Set(products.map(p => String(p.vendor)));
    if (vendorIds.size > 1) {
      return res.status(400).json({ error: 'An order can only contain products from a single vendor' });
    }
    const vendorId = [...vendorIds][0];

    const lineItems = items.map(it => {
      const p = products.find(pp => String(pp._id) === it.product);
      return { product: p._id, name: p.name, price: p.price, quantity: it.quantity };
    });
    const total = lineItems.reduce((sum, li) => sum + li.price * li.quantity, 0);

    const order = await Order.create({
      user: req.user.id,
      vendor: vendorId,
      items: lineItems,
      total,
      paymentMode,
      status: 'received',
      customerName,
      customerEmail,
      address,
      city,
      state,
      pincode,
      number,
      notes: notes || '',
      statusHistory: [{ status: 'received' }],
    });

    return res.status(201).json({ order });
  })
);

// ---- GET /api/orders/mine  (user: own orders) ----
router.get(
  '/mine',
  requireAuth,
  requireRole('user'),
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user.id })
      .populate('vendor', 'businessName category name')
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ orders });
  })
);

// ---- GET /api/orders/incoming  (vendor: incoming orders) ----
router.get(
  '/incoming',
  requireAuth,
  requireRole('vendor'),
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ vendor: req.user.id })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ orders });
  })
);

// ---- GET /api/orders/:id ----
router.get(
  '/:id',
  requireAuth,
  [param('id').custom(v => mongoose.isValidObjectId(v)).withMessage('Invalid order id')],
  handleValidation,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('vendor', 'businessName category name')
      .lean();
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const isOwner = String(order.user._id || order.user) === req.user.id;
    const isVendor = String(order.vendor._id || order.vendor) === req.user.id;
    if (req.user.role !== 'admin' && !isOwner && !isVendor) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return res.json({ order, nextAllowed: nextAllowed(order.status) });
  })
);

// ---- PUT /api/orders/:id/status  (vendor only) ----
router.put(
  '/:id/status',
  requireAuth,
  requireRole('vendor'),
  [
    param('id').custom(v => mongoose.isValidObjectId(v)).withMessage('Invalid order id'),
    body('status').isString().withMessage('Status is required'),
  ],
  handleValidation,
  asyncHandler(async (req, res) => {
    const { status: nextStatus } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (String(order.vendor) !== req.user.id) {
      return res.status(403).json({ error: 'You can only update your own orders' });
    }

    if (!canTransition(order.status, nextStatus)) {
      return res.status(400).json({
        error: `Cannot transition from ${order.status} to ${nextStatus}`,
        allowed: nextAllowed(order.status),
      });
    }

    order.status = nextStatus;
    order.statusHistory.push({ status: nextStatus, at: new Date() });
    await order.save();

    return res.json({ order, nextAllowed: nextAllowed(order.status) });
  })
);

module.exports = router;
