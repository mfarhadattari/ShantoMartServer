const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();


// ! ------------------ Products ---------------
router.get("/products", async (req, res) => {
  const productCollection = req.productCollection;
  const products = await productCollection.find().toArray();
  res.send(products);
});

// ! ------------------ Delete Product ---------------
router.delete("/delete-product/:id", async (req, res) => {
  const productCollection = req.productCollection;
  const id = req.params.id;
  const result = await productCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});

module.exports = router;
