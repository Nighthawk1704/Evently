const express = require('express');
const mongoose = require('mongoose');
const { body, query, param } = require('express-validator');

const Product = require('../models/Product');
const { requireAuth } = require('../middleware/requireAuth');
const { requireRole } = require('../middleware/requireRole');
const { handleValidation } = require('../middleware/handleValidation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

const CATEGORIES = ['catering', 'decor', 'photography', 'venue', 'sound_lighting', 'entertainment'];
const UNITS = ['per_event', 'per_person', 'per_hour', 'per_day'];

// ---- GET /api/products  (public) ----
router.get(
  '/',
  [
    query('vendor').optional().custom(v => mongoose.isValidObjectId(v)).withMessage('Invalid vendor id'),
    query('category').optional().isIn(CATEGORIES),
    query('q').optional().isString().isLength({ max: 100 }),
    query('page').optional().toInt().isInt({ min: 1 }),
    query('limit').optional().toInt().isInt({ min: 1, max: 50 }),
  ],
  handleValidation,
  asyncHandler(async (req, res) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 12;
    const skip = (page - 1) * limit;

    const filter = { isAvailable: true };
    if (req.query.vendor) filter.vendor = req.query.vendor;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.q) {
      filter.$or = [
        { name: { $regex: req.query.q, $options: 'i' } },
        { description: { $regex: req.query.q, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      Product.find(filter)
        .populate('vendor', 'businessName category name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return res.json({ items, total, page, limit, pages: Math.ceil(total / limit) });
  })
);

// ---- GET /api/products/:id  (public) ----
router.get(
  '/:id',
  [param('id').custom(v => mongoose.isValidObjectId(v)).withMessage('Invalid product id')],
  handleValidation,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('vendor', 'businessName category name description').lean();
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json({ product });
  })
);

// ---- Vendor-only from here down ----
const vendorOnly = [requireAuth, requireRole('vendor')];

// ---- GET /api/products/mine/list ----
router.get(
  '/mine/list',
  vendorOnly,
  asyncHandler(async (req, res) => {
    const items = await Product.find({ vendor: req.user.id }).sort({ createdAt: -1 }).lean();
    return res.json({ items });
  })
);

// ---- POST /api/products ----
router.post(
  '/',
  vendorOnly,
  [
    body('name').trim().isLength({ min: 2, max: 150 }).withMessage('Name is required'),
    body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 chars'),
    body('category').isIn(CATEGORIES).withMessage('Invalid category'),
    body('price').isFloat({ min: 0 }).toFloat().withMessage('Price must be >= 0'),
    body('unit').optional().isIn(UNITS).withMessage('Invalid unit'),
    body('imageUrl').optional().isString().isLength({ max: 500 }),
    body('isAvailable').optional().isBoolean().toBoolean(),
  ],
  handleValidation,
  asyncHandler(async (req, res) => {
    const product = await Product.create({ ...req.body, vendor: req.user.id });
    return res.status(201).json({ product });
  })
);

// ---- PUT /api/products/:id ----
router.put(
  '/:id',
  vendorOnly,
  [
    param('id').custom(v => mongoose.isValidObjectId(v)).withMessage('Invalid product id'),
    body('name').optional().trim().isLength({ min: 2, max: 150 }),
    body('description').optional().trim().isLength({ min: 10, max: 1000 }),
    body('category').optional().isIn(CATEGORIES),
    body('price').optional().isFloat({ min: 0 }).toFloat(),
    body('unit').optional().isIn(UNITS),
    body('imageUrl').optional().isString().isLength({ max: 500 }),
    body('isAvailable').optional().isBoolean().toBoolean(),
  ],
  handleValidation,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (String(product.vendor) !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own products' });
    }

    Object.assign(product, req.body);
    await product.save();
    return res.json({ product });
  })
);

// ---- DELETE /api/products/:id ----
router.delete(
  '/:id',
  vendorOnly,
  [param('id').custom(v => mongoose.isValidObjectId(v)).withMessage('Invalid product id')],
  handleValidation,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (String(product.vendor) !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own products' });
    }
    await product.deleteOne();
    return res.json({ ok: true });
  })
);

module.exports = router;
