const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();

// ! ------------------ Add to Cart ---------------
router.post("/add-to-cart", async (req, res) => {
  const cartCollection = req.cartCollection;
  const data = req.body;
  const query = { phoneNumber: data.phoneNumber, productID: data.productID };
  const alreadyExist = await cartCollection.findOne(query);
  if (alreadyExist) {
    const updateDoc = {
      $set: {
        quantity: alreadyExist.quantity + 1,
        price: data.price * (alreadyExist.quantity + 1),
      },
    };
    const result = await cartCollection.updateOne(query, updateDoc);
    return res.send(result);
  }
  const result = await cartCollection.insertOne(data);
  return res.send(result);
});

// ! ------------------ User Cart ---------------
router.get("/my-cart", async (req, res) => {
  const cartCollection = req.cartCollection;
  const query = {
    phoneNumber: `+${req.query?.phoneNumber?.split(" ")?.join("")}`,
  };
  const cart = await cartCollection.find(query).toArray();
  res.send(cart);
});

// ! ------------------ Delete Cart Item ---------------
router.delete("/delete-cart/:id", async (req, res) => {
  const cartCollection = req.cartCollection;
  const id = req.params.id;
  const result = await cartCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});

// ! ----------- Update Quantity of Cart Item---------------
router.patch("/update-quantity/:id", async (req, res) => {
  const cartCollection = req.cartCollection;
  const query = { _id: new ObjectId(req.params.id) };
  const cart = await cartCollection.findOne(query);
  const eachItemPrice = cart.price / cart.quantity;
  const updateDoc = {
    $set: {
      quantity: req.body.quantity,
      price: eachItemPrice * req.body.quantity,
    },
  };
  const result = await cartCollection.updateOne(query, updateDoc);
  res.send(result);
});

// !------------------ Place Order -----------------------
router.post("/place-order", async (req, res) => {
  const orderCollection = req.orderCollection;
  const cartCollection = req.cartCollection;
  const data = req.body;
  const cartsID = data.products.map((product) => new ObjectId(product.cartID));
  const insertResult = await orderCollection.insertOne(data);
  if (insertResult.insertedId) {
    const deleteResult = await cartCollection.deleteMany({
      _id: { $in: cartsID },
    });
    return res.send(deleteResult);
  }
  const cancelRequest = await orderCollection.deleteOne({
    _id: insertResult.insertedId,
  });
  res.send(cancelRequest);
});

module.exports = router;
