const { AppError } = require('../utils/AppError');

function errorHandler(err, _req, res, _next) {
  if (err && err.name === 'ZodError') {
    return res.status(400).json({
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request',
        details: err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message
        }))
      }
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      ok: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details || []
      }
    });
  }

  console.error('[error]', err);

  return res.status(500).json({
    ok: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Unexpected error',
      details: []
    }
  });
}

module.exports = errorHandler;
