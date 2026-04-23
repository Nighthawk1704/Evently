const { validationResult } = require('express-validator');

/**
 * Wrap express-validator's result into our consistent error shape:
 *   { error: 'Validation failed', fields: { email: 'Invalid email', ... } }
 */
function handleValidation(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const fields = {};
  for (const err of result.array()) {
    if (!fields[err.path]) fields[err.path] = err.msg;
  }
  return res.status(400).json({ error: 'Validation failed', fields });
}

module.exports = { handleValidation };
