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
  const customerExist = await customerCollection.findOne({ phoneNumber });
  if (!customerExist) {
    const addCustomer = await customerCollection.insertOne({
      name: displayName,
      phoneNumber,
      photoURL,
    });
  }
  res.send(result);
});

// ! --------------------Login user --------------
router.post("/login", async (req, res) => {
  const userCollection = req.userCollection;
  const { phoneNumber, password } = req.body;
  const user = await userCollection.findOne({ phoneNumber });
  if (!user) {
    return res.send({
      error: true,
      message: "Invalid phone number or password",
    });
  }
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.send({
      error: true,
      message: "Invalid phone number or password",
    });
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

// !---------------------- Verify User ---------------
router.post("/verify-user", authVerifyToken, async (req, res) => {
  const userCollection = req.userCollection;
  const userId = req.userId;
  const { password, phoneNumber } = req.body;
  const user = await userCollection.findOne({
    _id: new ObjectId(userId),
    phoneNumber,
  });
  if (!user) {
    return res.send({ verified: false, message: "Invalid phone number!" });
  }
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.send({ verified: false, message: "Invalid password!" });
  }
  res.send({ verified: true, message: "Successfully Verified!" });
});

// !--------------------- Update Profile ----------------
router.patch("/update-profile", authVerifyToken, async (req, res) => {
  const userCollection = req.userCollection;
  const query = { _id: new ObjectId(req.userId) };
  const data = req.body;
  const updateDoc = {
    $set: {
      ...data,
    },
  };
  const updateResult = await userCollection.updateOne(query, updateDoc);
  res.send(updateResult);
});


module.exports = router;
