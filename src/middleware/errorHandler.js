module.exports = (err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);
  const status = err.response?.status || err.status || 500;
  const message = err.message || 'internal error';
  res.status(status).json({ message });
};
