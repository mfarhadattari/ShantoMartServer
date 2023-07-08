const express = require("express");
const router = express.Router();

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

module.exports = router;
