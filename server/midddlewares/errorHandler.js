const errorHandler = (err, req, res, next) => {
  const code = err.statusCode || 500;
  res.status(code).json({
    message: err.message || 'Server error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;