const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// ! Middleware
app.use(cors());
app.use(express.json());

// ! Route Import
const publicRoute = require("./routes/publicRoute");
const adminRoute = require("./routes/adminRoute");

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    client.connect();
    //! Code here
    const db = client.db("ShantoMart");

    app.use((req, res, next) => {
      req.productCollection = db.collection("products");
      req.cartCollection = db.collection("carts");
      req.orderCollection = db.collection("orders");
      req.userCollection = db.collection("users");
      next();
    });

    // ! Router Middleware
    app.use("/", publicRoute);
    app.use("/admin", adminRoute);

    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Shanto Mart Server is Running");
});

app.listen(port, () => {
  console.log(`Shanto Mart Server is Running on port ${port}`);
});
