// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const { ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

// MongoDB URI (use .env variables)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.tdudv6t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// MongoDB client setup
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // connect database
    await client.connect();

    // database & collection
    const db = client.db("e-commerce");
    const productsCollection = db.collection("products");

    // get all products
    app.get("/products", async (req, res) => {
      const products = await productsCollection.find().toArray();
      res.send(products);
    });

    // add new product
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
    });

    // Update product by id
    app.put("/products/:id", async (req, res) => {
      const { id } = req.params;
      const updatedData = req.body;

      const { ObjectId } = require("mongodb");

      try {
        const result = await productsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({ message: "Product not found" });
        }

        res.send({ message: "Product updated successfully", result });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to update product", error });
      }
    });

    // Delete product by id
    app.delete("/products/:id", async (req, res) => {
      const { id } = req.params;
      const { ObjectId } = require("mongodb");

      try {
        const result = await productsCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).send({ message: "Product not found" });
        }

        res.send({ message: "Product deleted successfully", result });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to delete product", error });
      }
    });

    // check MongoDB connection
    await db.command({ ping: 1 });
    console.log("✅ Successfully connected to MongoDB!");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
}
run().catch(console.dir);

// test route
app.get("/", (req, res) => {
  res.send("🚀 E-commerce backend server is running!");
});

// start server
app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
