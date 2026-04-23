const express = require('express');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// ---- GET /api/vendors  (public) ----
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const vendors = await User.find({ role: 'vendor', isActive: true })
      .select('name businessName category description')
      .sort({ businessName: 1 })
      .lean();
    return res.json({ vendors });
  })
);

// ---- GET /api/vendors/:id (public) ----
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const vendor = await User.findOne({ _id: req.params.id, role: 'vendor', isActive: true })
      .select('name businessName category description')
      .lean();
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    return res.json({ vendor });
  })
);

module.exports = router;
