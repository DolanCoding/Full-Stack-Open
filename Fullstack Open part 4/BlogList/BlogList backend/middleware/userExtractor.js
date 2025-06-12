const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userExtractor = async (request, response, next) => {
  const token = request.token;
  if (!token) {
    request.user = null;
    return next();
  }
  try {
    const decodedToken = jwt.verify(token, "SECRET_KEY");
    if (!decodedToken.id) {
      request.user = null;
      return next();
    }
    const user = await User.findById(decodedToken.id);
    request.user = user || null;
    next();
  } catch (err) {
    request.user = null;
    next();
  }
};

module.exports = userExtractor;
