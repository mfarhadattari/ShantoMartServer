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
      message: "Invalid phone number!",
    });
  }
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.send({
      error: true,
      message: "Wrong password!",
    });
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  const userInfo = {
    _id: user._id,
    displayName: user.displayName,
    phoneNumber: user.phoneNumber,
    photoURL: user.photoURL,
    city: user?.city,
    location: user?.location,
  };
  res.send({ token, user: userInfo });
});

// ! --------------------Get user ---------------
router.get("/user", authVerifyToken, async (req, res) => {
  const userCollection = req.userCollection;
  const user = await userCollection.findOne({ _id: new ObjectId(req.userId) });
  if (!user) {
    return res.send({ error: true, message: "User not found" });
  }
  const userInfo = {
    _id: user._id,
    displayName: user.displayName,
    phoneNumber: user.phoneNumber,
    photoURL: user.photoURL,
    city: user?.city,
    location: user?.location,
  };
  res.send({ user: userInfo });
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

// !--------------------- Delete User ----------------
router.delete("/delete-user", authVerifyToken, async (req, res) => {
  const userCollection = req.userCollection;
  const deleteResult = await userCollection.deleteOne({
    _id: new ObjectId(req.userId),
  });
  res.send(deleteResult);
});

// !--------------------- Change Password --------------
router.patch("/change-password", authVerifyToken, async (req, res) => {
  const userCollection = req.userCollection;
  const userId = req.userId;
  const { phoneNumber, newPassword } = req.body;
  const query = { _id: new ObjectId(userId), phoneNumber };
  const updatePassword = {
    $set: { password: await bcrypt.hash(newPassword, 10) },
  };
  const changePassword = await userCollection.updateOne(query, updatePassword);
  res.send(changePassword);
});

// !------------------------ Change Phone Number ---------
router.patch("/change-phone-number", async (req, res) => {
  const userCollection = req.userCollection;
  const userId = req.userId;
  const { phoneNumber } = req.body;
  const phoneNumberUsed = await userCollection.findOne({ phoneNumber });
  if (phoneNumberUsed) {
    return res.send({ error: true, message: "Phone number is already used!" });
  }
  const updatePhone = await userCollection.updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        phoneNumber,
      },
    }
  );
  res.send(updatePhone);
});

module.exports = router;
