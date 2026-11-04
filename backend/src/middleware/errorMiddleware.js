const { sendError } = require('../utils/responseHelper');

function notFoundHandler(req, res, next) {
  return sendError(res, `Route not found: ${req.originalUrl}`, 404);
}

function globalErrorHandler(err, req, res, next) {
  console.error('[API Error]', err.message);
  const statusCode = err.statusCode || 500;
  return sendError(res, err.message || 'Server Error', statusCode);
}

module.exports = { notFoundHandler, globalErrorHandler };
