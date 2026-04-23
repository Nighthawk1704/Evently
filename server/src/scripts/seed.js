require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Request = require('../models/Request');
const Membership = require('../models/Membership');

async function seed() {
  const {
    MONGO_URI,
    ADMIN_EMAIL = 'admin@evently.dev',
    ADMIN_PASSWORD = 'ChangeMe#2026',
    ADMIN_NAME = 'Platform Admin',
  } = process.env;

  await connectDB(MONGO_URI);
  console.log('→ connected to mongo');

  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Request.deleteMany({}),
  ]);
  console.log('→ wiped collections');

  // ---- Users ----
  const admin = await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL.toLowerCase(),
    password: ADMIN_PASSWORD,
    role: 'admin',
  });

  const [vCatering, vFlorist, vDecoration, vLighting] = await User.create([
    {
      name: 'Priya Sharma',
      email: 'catering@evently.dev',
      password: 'Vendor#2026',
      role: 'vendor',
      businessName: 'Saffron Feasts',
      category: 'Catering',
      description: 'Full-service catering for weddings, corporate events and private parties. North & South Indian menus.',
      phone: '+91 98100 11111',
    },
    {
      name: 'Arjun Mehta',
      email: 'florist@evently.dev',
      password: 'Vendor#2026',
      role: 'vendor',
      businessName: 'Bloom & Petal',
      category: 'Florist',
      description: 'Handcrafted floral arrangements for all occasions.',
      phone: '+91 98100 22222',
    },
    {
      name: 'Kabir Singh',
      email: 'decor@evently.dev',
      password: 'Vendor#2026',
      role: 'vendor',
      businessName: 'Lumen Studios',
      category: 'Decoration',
      description: 'Modern event decor and styling.',
      phone: '+91 98100 33333',
    },
    {
      name: 'Suresh Lites',
      email: 'lighting@evently.dev',
      password: 'Vendor#2026',
      role: 'vendor',
      businessName: 'Flash & Glow',
      category: 'Lighting',
      description: 'Professional event lighting solutions.',
      phone: '+91 98100 44444',
    },
  ]);

  const [uAnita, uRohan] = await User.create([
    {
      name: 'Anita Desai',
      email: 'anita@evently.dev',
      password: 'User#2026',
      role: 'user',
      phone: '+91 98100 44444',
    },
    {
      name: 'Rohan Kapoor',
      email: 'rohan@evently.dev',
      password: 'User#2026',
      role: 'user',
      phone: '+91 98100 55555',
    },
  ]);

  console.log('→ created users (1 admin, 3 vendors, 2 users)');

  // ---- Products ----
  const products = await Product.create([
    // Catering
    {
      vendor: vCatering._id,
      name: 'Classic North Indian Buffet',
      description: 'Paneer tikka, dal makhani, biryani, 3 breads, salad bar, 2 desserts. Minimum 50 guests.',
      category: 'Catering',
      price: 850,
      unit: 'per_person',
    },
    {
      vendor: vCatering._id,
      name: 'Live Counter - Chaat & Tandoor',
      description: 'Two live counters with uniformed chefs. 2 hours of service. Includes setup and cleanup.',
      category: 'Catering',
      price: 18000,
      unit: 'per_event',
    },
    {
      vendor: vCatering._id,
      name: 'Corporate Lunch Package',
      description: 'Box lunches delivered on-site. Choice of veg, chicken, or paneer mains. Minimum 20 boxes.',
      category: 'Catering',
      price: 420,
      unit: 'per_person',
    },

    // Decoration
    {
      vendor: vDecoration._id,
      name: 'Floral Arch & Stage Backdrop',
      description: 'Handcrafted floral arch (roses, eustoma, eucalyptus) with coordinated 12ft stage backdrop.',
      category: 'Decoration',
      price: 42000,
      unit: 'per_event',
    },
    {
      vendor: vDecoration._id,
      name: 'Table Centerpieces - Editorial',
      description: 'Low-profile floral centerpieces with candles. Designed for conversation-friendly dining.',
      category: 'Decoration',
      price: 1800,
      unit: 'per_event',
    },

    // Lighting
    {
      vendor: vLighting._id,
      name: 'Ambient Lighting Package',
      description: 'Warm string lights, uplighters, and dimmable fixtures. Full setup and takedown.',
      category: 'Lighting',
      price: 25000,
      unit: 'per_event',
    },

    // Florist (Drawing 11 mentions Florist vendors)
    {
      vendor: vFlorist._id,
      name: 'Exotic Flower Bouquet',
      description: 'Mixed bouquet of lilies, orchids, and carnations.',
      category: 'Florist',
      price: 2500,
      unit: 'per_event',
    },
  ]);

  console.log(`→ created ${products.length} products`);

  // ---- Sample orders ----
  const cateringProd = products.find(p => p.name.includes('Classic North Indian'));
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + 21);

  await Order.create([
    {
      user: uAnita._id,
      vendor: vCatering._id,
      items: [{ product: cateringProd._id, name: cateringProd.name, price: cateringProd.price, quantity: 80 }],
      total: cateringProd.price * 80,
      paymentMode: 'UPI',
      status: 'ready_for_shipping',
      customerName: uAnita.name,
      customerEmail: uAnita.email,
      address: 'A-42, Greater Kailash II, New Delhi',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110048',
      number: uAnita.phone,
      notes: 'Engagement party. Please arrive by 5pm for setup.',
      statusHistory: [{ status: 'received' }, { status: 'ready_for_shipping' }],
    },
  ]);

  // ---- Membership Seed ----
  await Membership.create({
    membershipNumber: 'MEM-XYZ123',
    vendor: vCatering._id,
    plan: '1 year',
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    status: 'active'
  });

  console.log('→ created sample order & membership');

  // ---- Sample request ----
  await Request.create({
    user: uAnita._id,
    vendor: vDecoration._id,
    title: 'Moroccan-themed lounge setup',
    details: 'Looking for a lounge area with low seating, Moroccan lanterns, and rug layering. ~40 guests.',
    budget: 60000,
    eventDate,
    status: 'pending',
  });

  console.log('→ created 1 sample request');
  console.log('\n✓ seed complete');
  console.log('─'.repeat(60));
  console.log('Demo credentials:');
  console.log(`  admin    ${admin.email} / ${ADMIN_PASSWORD}`);
  console.log(`  vendor   ${vCatering.email} / Vendor#2026`);
  console.log(`  vendor   ${vFlorist.email} / Vendor#2026`);
  console.log(`  vendor   ${vDecoration.email} / Vendor#2026`);
  console.log(`  vendor   ${vLighting.email} / Vendor#2026`);
  console.log(`  user     ${uAnita.email} / User#2026`);
  console.log(`  user     ${uRohan.email} / User#2026`);
  console.log('─'.repeat(60));
}

seed()
  .then(() => disconnectDB())
  .then(() => process.exit(0))
  .catch(err => {
    console.error('✗ seed failed:', err);
    disconnectDB().finally(() => process.exit(1));
  });
