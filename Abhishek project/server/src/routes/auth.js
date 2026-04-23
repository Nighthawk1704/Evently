const express = require('express');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');

const User = require('../models/User');
const { handleValidation } = require('../middleware/handleValidation');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || 5),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again in a few minutes.' },
});

function signToken(user) {
  return jwt.sign(
    { id: String(user._id), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

const VENDOR_CATEGORIES = ['catering', 'decor', 'photography', 'venue', 'sound_lighting', 'entertainment'];

// ---- POST /api/auth/signup ----
router.post(
  '/signup',
  authLimiter,
  [
    body('role').isIn(['user', 'vendor']).withMessage('Role must be user or vendor'),
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be 8-128 characters'),
    body('phone').optional().trim().isLength({ max: 20 }),
    body('businessName')
      .if(body('role').equals('vendor'))
      .trim()
      .isLength({ min: 2, max: 120 })
      .withMessage('Business name is required for vendors'),
    body('category')
      .if(body('role').equals('vendor'))
      .isIn(VENDOR_CATEGORIES)
      .withMessage('Invalid vendor category'),
    body('description')
      .if(body('role').equals('vendor'))
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Description is required for vendors (10-500 chars)'),
  ],
  handleValidation,
  asyncHandler(async (req, res) => {
    const { role, name, email, password, phone, businessName, category, description } = req.body;

    const doc = { role, name, email, password, phone };
    if (role === 'vendor') Object.assign(doc, { businessName, category, description });

    const user = await User.create(doc);
    const token = signToken(user);
    return res.status(201).json({ token, user: user.toJSON() });
  })
);

// ---- POST /api/auth/login ----
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('password').isString().notEmpty().withMessage('Password is required'),
  ],
  handleValidation,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.isActive) return res.status(403).json({ error: 'Account is deactivated' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    return res.json({ token, user: user.toJSON() });
  })
);

// ---- GET /api/auth/me ----
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: user.toJSON() });
  })
);

module.exports = router;
