const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();

// ! ---------------- Admin Overviews -------------
router.get("/overviews", async (req, res) => {
  const productCollection = req.productCollection;
  const orderCollection = req.orderCollection;
  const customerCollection = req.customerCollection;
  const cartCollection = req.cartCollection;

  const totalProduct = await productCollection.estimatedDocumentCount();
  const totalOrder = await orderCollection.estimatedDocumentCount();
  const totalCart = await cartCollection.estimatedDocumentCount();
  const totalCustomer = await customerCollection.estimatedDocumentCount();

  res.send({ totalProduct, totalCustomer, totalCart, totalOrder });
});

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

// ! ------------------ Add A Product ---------------
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

// ! ---------------- Get all Customers ------- //
router.get("/customers", async (req, res) => {
  const customerCollection = req.customerCollection;
  const customers = await customerCollection.find().toArray();
  res.send(customers.reverse());
});

// ! ---------------- Customer Details ---- /
router.get("/customers/:id", async (req, res) => {
  const customerCollection = req.customerCollection;
  const orderCollection = req.orderCollection;
  const cartCollection = req.cartCollection;
  const id = req.params.id;
  const customerInfo = await customerCollection.findOne({
    _id: new ObjectId(id),
  });
  const ordersInfo = await orderCollection
    .find(
      { userPhone: customerInfo?.phoneNumber },
      { projection: { _id: 1, totalAmount: 1, status: 1 } }
    )
    .toArray();

  const cart = await cartCollection
    .find({
      phoneNumber: customerInfo?.phoneNumber,
    })
    .toArray();

  res.send({
    customerInfo,
    cart,
    ordersInfo,
  });
});

// ! ------------------ Add A Customer ---------------
router.post("/add-customer", async (req, res) => {
  const customerCollection = req.customerCollection;
  const data = req.body;
  const alreadyExist = await customerCollection.findOne({
    phoneNumber: data.phoneNumber,
  });
  if (alreadyExist) {
    return res.send({ alreadyExist: true });
  }
  const result = await customerCollection.insertOne(data);
  res.send(result);
});

// ! ---------------- Get all Orders ------- //
router.get("/orders", async (req, res) => {
  const orderCollection = req.orderCollection;
  const customers = await orderCollection.find().toArray();
  res.send(customers.reverse());
});

// ! ---------------- Order Details ---- /
router.get("/orders/:id", async (req, res) => {
  const orderCollection = req.orderCollection;
  const id = req.params.id;
  const order = await orderCollection.findOne({ _id: new ObjectId(id) });
  res.send(order);
});

// ! ----------- Update status of order---------------
router.patch("/update-status/:id", async (req, res) => {
  const orderCollection = req.orderCollection;
  const query = { _id: new ObjectId(req.params.id) };
  const updateDoc = {
    $set: {
      status: req.body.status,
    },
  };
  const result = await orderCollection.updateOne(query, updateDoc);
  res.send(result);
});

module.exports = router;
