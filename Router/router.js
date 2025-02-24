// routes/itemRoutes.js
const express = require("express");
const router = express.Router();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const _secret = process.env.SECRET_KEY;
const saltRounds = 10;
const { Register,Package,StudentModel } = require("../models/Items"); // Import the Item model
const multer = require("multer");



router.post("/Login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email,password);
  

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const user = await Register.findOne({ email: email });
  console.log(user.role);
  

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
      role:user.role
    });
  } catch (_error) {
    res.status(500).json({ _error: "Internal server error" });
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

router.get("/packages", async (_req, res) => {
  try {
    const packages = await Package.find();
    const _formattedPackages = packages.map(pkg => ({
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
  try {
    const { fullName, userName, phone, email, password, role } = req.body;

    // Validate required fields
    if (!fullName || !userName || !phone || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Check if phone or email already exists
    const existingUser = await Register.findOne({ $or: [{ phone }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: "Phone number or Email already in use!" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object
    const userData = {
      fullName,
      userName,
      phone,
      email,
      password: hashedPassword,
      role,
    };

    // Generate IDs only for Student and Industry Representative
    if (role === "Student") {
      userData.studentID = `STU-${Math.floor(10000 + Math.random() * 90000)}`;
    } else if (role === "Industry Representative") {
      userData.industryID = `IND-${Math.floor(10000 + Math.random() * 90000)}`;
    }

    // Create new user
    const newUser = new Register(userData);
    await newUser.save();
    res.status(201).json({ message: "User registered successfully." });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/api/student-details", async (req, res) => {
  try {
    console.log(req.query);
    
    const { studentID } = req.query;
    console.log(studentID);
    
    const student = await StudentModel.findOne({ studentID });
console.log(student);

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    console.error("Error fetching student details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.post("/api/submit-request", async (req, res) => {
  try {
    console.log(req.body);
    
   // const newRequest = new RequestModel(req.body);
   // await newRequest.save();
    res.status(201).json({ message: "Request submitted successfully!" });
  } catch (error) {
    console.error("Error submitting request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Export the router
module.exports = router;
