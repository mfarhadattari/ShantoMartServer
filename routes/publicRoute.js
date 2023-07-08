const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();

// ! ------------------ Products ---------------
router.get("/products", async (req, res) => {
  const productCollection = req.productCollection;
  const products = await productCollection.find().toArray();
  res.send(products);
});

// ! ------------------ Products Details ---------------
router.get("/products/:id", async (req, res) => {
  const productCollection = req.productCollection;
  const id = req.params.id;
  const product = await productCollection.findOne({ _id: new ObjectId(id) });
  res.send(product);
});

// ! ---------------- New Products --------------------
router.get("/new-products", async (req, res) => {
  const productCollection = req.productCollection;
  const newProducts = await productCollection
    .find({})
    .sort({ timeDate: -1 })
    .limit(6)
    .toArray();

  res.send(newProducts);
});

module.exports = router;
