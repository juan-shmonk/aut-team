class AppError extends Error {
  constructor({ statusCode = 500, code = 'INTERNAL_ERROR', message = 'Error', details = [] }) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

module.exports = { AppError };
