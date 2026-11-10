const { sendError } = require('../utils/responseHelper');

function notFoundHandler(req, res) {
  return sendError(res, `Route not found: ${req.originalUrl}`, 404);
}

function globalErrorHandler(err, req, res, next) {
  console.error('[Error]', err.message);
  return sendError(res, err.message || 'Server Error', err.statusCode || 500);
}

module.exports = { notFoundHandler, globalErrorHandler };
