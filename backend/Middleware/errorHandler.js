const logger = require('../utils/logger');

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?._id,
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(isDevelopment && { stack: err.stack }),
  });
};

// 404 handler
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFoundHandler };
