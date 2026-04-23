const express = require('express');
const mongoose = require('mongoose');
const { param, query, body } = require('express-validator');

const User = require('../models/User');
const Order = require('../models/Order');
const Membership = require('../models/Membership');
const { requireAuth } = require('../middleware/requireAuth');
const { requireRole } = require('../middleware/requireRole');
const { handleValidation } = require('../middleware/handleValidation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
const adminOnly = [requireAuth, requireRole('admin')];

// ---- Membership Lookup by Number ----
router.get(
  '/memberships/:membershipNumber',
  adminOnly,
  asyncHandler(async (req, res) => {
    const mem = await Membership.findOne({ membershipNumber: req.params.membershipNumber }).populate('vendor', 'name email businessName');
    if (!mem) return res.status(404).json({ error: 'Membership not found' });
    return res.json(mem);
  })
);

// ---- Add Membership ----
router.post(
  '/memberships',
  adminOnly,
  [
    body('vendorId').custom(v => mongoose.isValidObjectId(v)).withMessage('Invalid vendor id'),
    body('plan').isIn(['6 months', '1 year', '2 years']).withMessage('Invalid plan'),
  ],
  handleValidation,
  asyncHandler(async (req, res) => {
    const { vendorId, plan } = req.body;
    
    // Auto-generate membership number
    const membershipNumber = 'MEM-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Calculate expiry based on plan
    const expiresAt = new Date();
    if (plan === '6 months') expiresAt.setMonth(expiresAt.getMonth() + 6);
    else if (plan === '1 year') expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    else if (plan === '2 years') expiresAt.setFullYear(expiresAt.getFullYear() + 2);

    const mem = new Membership({
      membershipNumber,
      vendor: vendorId,
      plan,
      expiresAt
    });
    
    await mem.save();
    return res.status(201).json(mem);
  })
);

// ---- Update/Extend Membership ----
router.put(
  '/memberships/:membershipNumber',
  adminOnly,
  [
    body('action').isIn(['extend', 'cancel']).withMessage('Action must be extend or cancel'),
    body('plan').optional().isIn(['6 months', '1 year', '2 years']),
  ],
  handleValidation,
  asyncHandler(async (req, res) => {
    const mem = await Membership.findOne({ membershipNumber: req.params.membershipNumber });
    if (!mem) return res.status(404).json({ error: 'Membership not found' });

    if (req.body.action === 'cancel') {
      mem.status = 'cancelled';
    } else if (req.body.action === 'extend') {
      const plan = req.body.plan || '6 months';
      if (plan === '6 months') mem.expiresAt.setMonth(mem.expiresAt.getMonth() + 6);
      else if (plan === '1 year') mem.expiresAt.setFullYear(mem.expiresAt.getFullYear() + 1);
      else if (plan === '2 years') mem.expiresAt.setFullYear(mem.expiresAt.getFullYear() + 2);
      mem.status = 'active';
      mem.plan = plan;
    }

    await mem.save();
    return res.json(mem);
  })
);

// ---- GET /api/admin/users ----
router.get(
  '/users',
  adminOnly,
  [
    query('role').optional().isIn(['user', 'vendor', 'admin']),
    query('page').optional().toInt().isInt({ min: 1 }),
    query('limit').optional().toInt().isInt({ min: 1, max: 50 }),
  ],
  handleValidation,
  asyncHandler(async (req, res) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const filter = {};
    if (req.query.role) filter.role = req.query.role;

    const [items, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      User.countDocuments(filter),
    ]);

    return res.json({
      items: items.map(u => u.toJSON()),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  })
);

// ---- PUT /api/admin/users/:id/active ----
router.put(
  '/users/:id/active',
  adminOnly,
  [
    param('id').custom(v => mongoose.isValidObjectId(v)).withMessage('Invalid user id'),
    body('isActive').isBoolean().toBoolean().withMessage('isActive must be boolean'),
  ],
  handleValidation,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') {
      return res.status(400).json({ error: 'Admins cannot be deactivated via this endpoint' });
    }

    user.isActive = req.body.isActive;
    await user.save();
    return res.json({ user: user.toJSON() });
  })
);

// ---- GET /api/admin/orders ----
router.get(
  '/orders',
  adminOnly,
  [
    query('status').optional().isIn(['received', 'ready_for_shipping', 'out_for_delivery', 'cancelled']),
    query('page').optional().toInt().isInt({ min: 1 }),
    query('limit').optional().toInt().isInt({ min: 1, max: 50 }),
  ],
  handleValidation,
  asyncHandler(async (req, res) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email')
        .populate('vendor', 'businessName category name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return res.json({ orders, total, page, limit, pages: Math.ceil(total / limit) });
  })
);

// ---- GET /api/admin/stats (Reports Module) ----
router.get(
  '/stats',
  adminOnly,
  asyncHandler(async (_req, res) => {
    const [userCount, vendorCount, orderCount, receivedCount, deliveredCount, revenueAgg] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'vendor' }),
      Order.countDocuments({}),
      Order.countDocuments({ status: 'received' }),
      Order.countDocuments({ status: 'out_for_delivery' }),
      Order.aggregate([
        { $match: { status: 'out_for_delivery' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    return res.json({
      users: userCount,
      vendors: vendorCount,
      orders: orderCount,
      received: receivedCount,
      delivered: deliveredCount, // Using out_for_delivery as final for now per spec
      revenue: revenueAgg[0]?.total || 0,
    });
  })
);

module.exports = router;
