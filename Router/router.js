// routes/itemRoutes.js
const express = require("express");
const router = express.Router();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const secret = process.env.SECRET_KEY;
const saltRounds = 10;
const { User } = require("../models/Items"); // Import the Item model
const { useState } = require("react");

router.post("/Login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email);
  

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
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
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/register", async (req, res) => {
  const { fullName,userName,phone,email, password } = req.body;
    
console.log(email);

  if (!fullName || !userName || !phone || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }
 
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
    const newUser = new User({ fullName,userName,phone,email, password: hashedPassword });
    console.log(newUser);
    
    await newUser.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Export the router
module.exports = router;
