function notFound(req, res) {
  res.status(404).json({ success: false, error: 'Resource not found' });
}

function errorHandler(err, req, res, next) {
  console.error(err.message);
  const isMulterError = err.name === 'MulterError' || /only.*images are allowed/i.test(err.message || '');
  const status = err.status || (isMulterError ? 400 : 500);
  res.status(status).json({
    success: false,
    error: status === 500 ? 'Internal server error' : err.message,
  });
}

module.exports = { notFound, errorHandler };
