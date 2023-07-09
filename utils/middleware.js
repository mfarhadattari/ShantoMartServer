const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (error, decodedToken) => {
    if (error) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.userId = decodedToken.userId;
    next();
  });
};

module.exports = { verifyToken };
