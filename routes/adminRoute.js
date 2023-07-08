const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();


// ! ------------------ Products ---------------
router.get("/products", async (req, res) => {
  const productCollection = req.productCollection;
  const products = await productCollection.find().toArray();
  res.send(products.reverse());
});

// ! ------------------ Delete Product ---------------
router.delete("/delete-product/:id", async (req, res) => {
  const productCollection = req.productCollection;
  const id = req.params.id;
  const result = await productCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});

// ! ------------------ Add to Product ---------------
router.post("/add-product", async (req, res) => {
  const productCollection = req.productCollection;
  const data = req.body;
  const result = await productCollection.insertOne(data);
  res.send(result);
});

module.exports = router;
