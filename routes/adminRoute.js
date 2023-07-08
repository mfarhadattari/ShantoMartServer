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

// ! ----------- Update Product ---------------
router.patch("/update-product/:id", async (req, res) => {
  const productCollection = req.productCollection;
  const query = { _id: new ObjectId(req.params.id) };
  const data = req.body;
  const updateDoc = {
    $set: {
      ...data,
    },
  };
  const result = await productCollection.updateOne(query, updateDoc);
  res.send(result);
});

module.exports = router;
