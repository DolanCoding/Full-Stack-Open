const requestLogger = (req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  if (Object.keys(req.body || {}).length > 0) {
    console.log("Body:", req.body);
  }
  next();
};

module.exports = { requestLogger };
