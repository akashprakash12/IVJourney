// routes/itemRoutes.js
const express = require("express");
const router = express.Router();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const secret = process.env.SECRET_KEY;
const saltRounds = 10;
const { Item, User } = require("../models/Items"); // Import the Item model

// API endpoint to create an item
router.post("/items", async (req, res) => {
  console.log("Received request:", req.body);
  try {
    const item = new Item(req.body);
    await item.save();
    console.log("Sending response:", item);
    res.status(201).send(item);
  } catch (error) {
    console.error("Error in API:", error);
    res.status(500).send({ error: "Failed to save item" });
  }
});

router.post("/Login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email });
    console.log("Retrieved user:", user.password);

    if (!user) {
      console.error("User not found for email:", email);
      return res.status(401).json({ error: "Invalid credentials." });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.error("Password is incorrect for email:", email);
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign({ userId: user._id }, "your_secret_key", {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  console.log("Received request:", req.body);

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists." });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Export the router
module.exports = router;
