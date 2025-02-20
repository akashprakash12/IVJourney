// routes/itemRoutes.js
const express = require("express");
const router = express.Router();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const secret = process.env.SECRET_KEY;
const saltRounds = 10;
const { Register,Package } = require("../models/Items"); // Import the Item model
const multer = require("multer");



router.post("/Login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email);
  

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const user = await Register.findOne({ email: email });

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
const storage = multer.memoryStorage(); // Stores file in memory, or use diskStorage for saving to disk
const upload = multer({ storage: storage });
router.post("/packages", upload.single("image"), async (req, res) => {
  try {
    console.log("Received Data:", req.body); // Form fields
    console.log("Received File:", req.file); // Uploaded image
    const newPackage = new Package({
      packageName: req.body.packageName,
      description: req.body.description,
      duration: req.body.duration,
      price: req.body.price,
      activities: JSON.parse(req.body.activities), // Parse activities array
      inclusions: req.body.inclusions,
      image: req.file ? req.file.buffer.toString("base64") : null, // Convert image to base64 (or store in Cloudinary)
    });


    await newPackage.save();
    res.status(201).json({ message: "Package saved successfully!", package: newPackage });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/packages", async (req, res) => {
  try {
    const packages = await Package.find();
    const formattedPackages = packages.map(pkg => ({
      ...pkg._doc,
      image: pkg.image ? pkg.image.toString("base64") : null, // Convert Buffer to Base64
    }));
   
    res.status(200).json(packages);
  } catch (error) {
    console.error("Error fetching packages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/register", async (req, res) => {
  const { fullName,userName,phone,email, password } = req.body;
    
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
    const existingUser = await Register.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists." });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newRegister = new Register({
      fullName,
      userName,
      phone,
      email,
      password: hashedPassword,
    });
    await newRegister.save();
    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Export the router
module.exports = router;
