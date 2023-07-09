const jwt = require("jsonwebtoken");
require("dotenv").config();

const authVerifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.send({ error: true, message: "Unauthorized" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (error, decodedToken) => {
    if (error) {
      return res.send({ error:true, message: "Invalid token" });
    }
    req.userId = decodedToken.userId;
    next();
  });
};

module.exports = { authVerifyToken };
