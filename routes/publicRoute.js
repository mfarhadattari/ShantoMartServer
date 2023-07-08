const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();

// ! Add to cart API
router.post("/add-to-cart", async (req, res) => {
  const cartCollection = req.cartCollection;
  const data = req.body;
  const query = { phoneNumber: data.phoneNumber, productID: data.productID };
  const alreadyExist = await cartCollection.findOne(query);
  if (alreadyExist) {
    const updateDoc = {
      $set: {
        quantity: alreadyExist.quantity + 1,
        price: data.price,
      },
    };
    const result = await cartCollection.updateOne(query, updateDoc);
    return res.send(result);
  }
  const result = await cartCollection.insertOne(data);
  return res.send(result);
});

// ! All Products API
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
