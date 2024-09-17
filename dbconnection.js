//this is not a part of the exercise

const { createServer } = require("node:http");
const mongoose = require("mongoose");

const hostname = "127.0.0.1";
const port = 3000;

const url = "mongodb://localhost:27017/pizza";

const pizzaSchema = new mongoose.Schema(
  {
    name: String,
    shape: String,
  },
  { collection: "pizzaMenu" }
);

pizzaSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Pizza = mongoose.model("Pizza", pizzaSchema);

async function connectToDB() {
  try {
    await mongoose.connect(url);
    console.log("Connected to MongoDB with Mongoose");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    throw err;
  }
}

async function addPizza(pizzaData) {
  try {
    const pizza = new Pizza(pizzaData);
    const result = await pizza.save();
    return result._id;
  } catch (err) {
    console.error("Failed to insert pizza", err);
    throw err;
  }
}

async function getAllPizzas() {
  try {
    const pizzas = await Pizza.find({});
    return pizzas;
  } catch (err) {
    console.error("Failed to get all pizzas", err);
    throw err;
  }
}

async function requestHandler(req, res) {
  console.log(`Received request: ${req.method} ${req.url}`);
  if (req.url === "/add-pizza" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const pizzaData = JSON.parse(body);
        console.log("Received pizza data", pizzaData);
        await connectToDB();
        const id = await addPizza(pizzaData);
        res.statusCode = 201;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ message: "Pizza added", id: id }));
      } catch (err) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({ message: "Error adding pizza", error: err.message })
        );
      } finally {
        mongoose.connection.close();
      }
    });
  } else if (req.method === "GET") {
    try {
      await connectToDB();
      const pizzas = await getAllPizzas();
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(pizzas));
    } catch (err) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({ message: "Error getting pizzas", error: err.message })
      );
    } finally {
      mongoose.connection.close();
    }
  } else {
    console.log(`Handling non-matching request: ${req.method} ${req.url}`);
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Hello World" }));
  }
}

const server = createServer((req, res) => {
  requestHandler(req, res);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
