const express = require('express');
const mongoose = require('mongoose');
const { body, param } = require('express-validator');

const Request = require('../models/Request');
const User = require('../models/User');
const { requireAuth } = require('../middleware/requireAuth');
const { requireRole } = require('../middleware/requireRole');
const { handleValidation } = require('../middleware/handleValidation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// ---- POST /api/requests  (user only) ----
router.post(
  '/',
  requireAuth,
  requireRole('user'),
  [
    body('vendor').custom(v => mongoose.isValidObjectId(v)).withMessage('Invalid vendor id'),
    body('title').trim().isLength({ min: 3, max: 150 }).withMessage('Title is required'),
    body('details').trim().isLength({ min: 10, max: 1000 }).withMessage('Details are required (10-1000 chars)'),
    body('budget').optional().isFloat({ min: 0 }).toFloat(),
    body('eventDate').isISO8601().toDate().withMessage('Invalid event date'),
  ],
  handleValidation,
  asyncHandler(async (req, res) => {
    const vendor = await User.findById(req.body.vendor).lean();
    if (!vendor || vendor.role !== 'vendor') return res.status(400).json({ error: 'Invalid vendor' });

    const created = await Request.create({ ...req.body, user: req.user.id });
    return res.status(201).json({ request: created });
  })
);

// ---- GET /api/requests/mine  (user) ----
router.get(
  '/mine',
  requireAuth,
  requireRole('user'),
  asyncHandler(async (req, res) => {
    const items = await Request.find({ user: req.user.id })
      .populate('vendor', 'businessName category name')
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ items });
  })
);

// ---- GET /api/requests/incoming  (vendor) ----
router.get(
  '/incoming',
  requireAuth,
  requireRole('vendor'),
  asyncHandler(async (req, res) => {
    const items = await Request.find({ vendor: req.user.id })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ items });
  })
);

// ---- PUT /api/requests/:id/respond  (vendor) ----
router.put(
  '/:id/respond',
  requireAuth,
  requireRole('vendor'),
  [
    param('id').custom(v => mongoose.isValidObjectId(v)).withMessage('Invalid request id'),
    body('status').isIn(['accepted', 'rejected']).withMessage('Status must be accepted or rejected'),
    body('vendorResponse').optional().trim().isLength({ max: 500 }),
  ],
  handleValidation,
  asyncHandler(async (req, res) => {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (String(request.vendor) !== req.user.id) {
      return res.status(403).json({ error: 'You can only respond to your own requests' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ error: `Request already ${request.status}` });
    }

    request.status = req.body.status;
    request.vendorResponse = req.body.vendorResponse || '';
    await request.save();
    return res.json({ request });
  })
);

module.exports = router;
