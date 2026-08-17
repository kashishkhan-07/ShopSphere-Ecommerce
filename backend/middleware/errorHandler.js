const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details for development
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error Caught]:', err);
  }

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with ID of ${err.value}`;
    return res.status(404).json({ success: false, message });
  }

  // Handle Mongoose Duplicate Key (e.g. email or store name already taken)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value entered for '${field}'. Please use another value.`;
    return res.status(400).json({ success: false, message });
  }

  // Handle Mongoose Schema Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    return res.status(400).json({ success: false, message });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid authentication token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Session token has expired. Please log in again.' });
  }

  // Default server error
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;