require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { connectDB, disconnectDB } = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const requestRoutes = require('./routes/requests');
const adminRoutes = require('./routes/admin');
const vendorRoutes = require('./routes/vendors');

const app = express();

// ---- Core middleware ----
app.use(helmet());

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // allow server-to-server/Postman (no origin) and any explicitly whitelisted origin
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ---- Health check ----
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development', time: new Date().toISOString() });
});

// ---- Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/admin', adminRoutes);

// ---- 404 ----
app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.path}` });
});

// ---- Error handler (last) ----
app.use(errorHandler);

// ---- Startup ----
const PORT = Number(process.env.PORT || 5000);

async function start() {
  await connectDB(process.env.MONGO_URI);
  // eslint-disable-next-line no-console
  console.log('→ connected to mongo');

  const server = app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`→ evently api listening on :${PORT}`);
  });

  const shutdown = async signal => {
    // eslint-disable-next-line no-console
    console.log(`\n→ received ${signal}, shutting down`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    // Force exit if stuck
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Only start the server when running directly (not when imported for tests).
if (require.main === module) {
  start().catch(err => {
    // eslint-disable-next-line no-console
    console.error('✗ failed to start:', err);
    process.exit(1);
  });
}

module.exports = app;
