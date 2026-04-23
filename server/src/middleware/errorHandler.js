/**
 * Wrap async route handlers so thrown errors reach the error middleware
 * without repetitive try/catch blocks.
 */
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

/**
 * Central error handler. Distinguishes common Mongo/Mongoose errors from
 * generic 500s and returns our consistent error shape.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Mongoose validation (in case something slipped past express-validator)
  if (err?.name === 'ValidationError') {
    const fields = {};
    for (const [path, e] of Object.entries(err.errors || {})) fields[path] = e.message;
    return res.status(400).json({ error: 'Validation failed', fields });
  }

  // Duplicate key (unique index violation)
  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({ error: `${field} already in use` });
  }

  // Mongoose CastError - bad ObjectId that slipped past isValidObjectId
  if (err?.name === 'CastError') {
    return res.status(400).json({ error: `Invalid ${err.path}` });
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error' : err.message;

  if (status === 500) {
    // eslint-disable-next-line no-console
    console.error('[error]', err);
  }
  return res.status(status).json({ error: message });
}

module.exports = { asyncHandler, errorHandler };
