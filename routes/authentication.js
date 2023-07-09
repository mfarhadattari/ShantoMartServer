const express = require("express");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const { authVerifyToken } = require("../utils/middleware");
require("dotenv").config();

const router = express.Router();

// ! --------------------Create user --------------
router.post("/create-account", async (req, res) => {
  const userCollection = req.userCollection;
  const customerCollection = req.customerCollection;
  const { displayName, phoneNumber, photoURL, password } = req.body;
  const alreadyExist = await userCollection.findOne({ phoneNumber });
  if (alreadyExist) {
    return res.send({ alreadyAccount: true });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await userCollection.insertOne({
    displayName,
    phoneNumber,
    photoURL,
    password: hashedPassword,
  });
  const addCustomer = await customerCollection.insertOne({
    displayName,
    phoneNumber,
    photoURL,
  });
  res.send(result);
});

// ! --------------------Login user --------------
router.post("/login", async (req, res) => {
  const userCollection = req.userCollection;
  const { phoneNumber, password } = req.body;
  const user = await userCollection.findOne({ phoneNumber });
  if (!user) {
    return res
      .status(401)
      .send({ error: true, message: "Invalid phone number or password" });
  }
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res
      .status(401)
      .send({ error: true, message: "Invalid phone number or password" });
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.send({ token, user });
});

// ! --------------------Get user ---------------
router.get("/user", authVerifyToken, async (req, res) => {
  const userCollection = req.userCollection;
  const user = await userCollection.findOne({ _id: new ObjectId(req.userId) });
  if (!user) {
    return res.send({ error: true, message: "User not found" });
  }
  res.send({ user: user });
});

module.exports = router;
