import mongoose from "mongoose";
import express from "express";
import cors from "cors";

const hostname = "127.0.0.1";
const port = 3000;

const app = express();
app.use(cors());
app.use(express.json());

const url = "mongodb://localhost:27017/message";

const messageSchema = new mongoose.Schema(
  {
    content: String,
  },
  {
    versionKey: false,
  },
  { collection: "messages" }
);

const Message = mongoose.model("Message", messageSchema);
async function connectToDB() {
  try {
    await mongoose.connect(url);
    console.log("Connected to MongoDB with Mongoose");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    throw err;
  }
}

connectToDB();

app.post("/", async (req, res) => {
  const { content } = req.body;
  console.log("Received message:", content);

  try {
    const message = new Message({ content });
    const result = await message.save();
    res.status(200).json({ id: result._id });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).send("Failed to save message.");
  }
});

app.get("/", async (req, res) => {
  try {
    const messages = await Message.find({});
    res.json(messages);
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).send("Failed to get messages.");
  }
});

app.delete("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("Deleting message with ID:", id);

  try {
    await Message.findByIdAndDelete(id);
    res.status(200).send("Message deleted");
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).send("Failed to delete message.");
  }
});

app.get("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("Getting message with ID:", id);

  try {
    const message = await Message.findById(id);
    res.json(message);
  } catch (error) {
    console.error("Error getting message:", error);
    res.status(500).send("Failed to get message.");
  }
});

app.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  console.log("Updating message with ID:", id);

  try {
    if (!content || typeof content !== "string") {
      return res.status(400).send("Invalid content provided.");
    }
    const updatedMessage = await Message.findByIdAndUpdate(
      id,
      { content },
      { new: true, runValidators: true }
    );

    if (!updatedMessage) {
      return res.status(404).send("Message not found.");
    }
    res.status(200).send("Message updated");
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).send("Failed to update message.");
  }
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
