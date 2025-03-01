// routes/itemRoutes.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const _secret = process.env.SECRET_KEY;
const saltRounds = 10;
const {
  Register,
  Package,
  StudentModel,
  Request,
  Profile,
} = require("../models/Items"); // Import the Item model
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const IP = process.env.IP;
console.log(IP);

// const storage = multer.memoryStorage(); // Stores file in memory, or use diskStorage for saving to disk
// const upload = multer({ storage: storage });

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.post("/Login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

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
    console.log("User logged in:", user.fullName, "-", user.role, user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
      userDetails: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        studentID: user.studentID || null, // Include student ID if available
        industryID: user.industryID || null, // Include industry ID if available
        createdAt: user.createdAt,
      },
    });
  } catch (_error) {
    res.status(500).json({ _error: "Internal server error" });
  }
});

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
    res
      .status(201)
      .json({ message: "Package saved successfully!", package: newPackage });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});
router.get("/packages", async (_req, res) => {
  try {
    const packages = await Package.find();
    if (!packages || packages.length === 0) {
      return res.status(404).json({ error: "No packages available" });
    }
    const formattedPackages = packages.map((pkg) => ({
      label: pkg.packageName, // Ensure packageName is correctly formatted
      value: pkg.packageName,
      ...pkg._doc, // Include other data
      image: pkg.image ? pkg.image.toString("base64") : null, // Convert Buffer to Base64
    }));

    res.status(200).json(formattedPackages);
  } catch (error) {
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
    const existingUser = await Register.findOne({
      $or: [{ phone }, { email }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Phone number or Email already in use!" });
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

router.get("/api/register", async (req, res) => {
  try {
    const { role } = req.query; // Get role from query parameters
    console.log("Requested Role:", role);

    if (!role) {
      return res.status(400).json({ error: "Role parameter is required" });
    }

    // Fetch users based on role
    const users = await Register.find({ role });
    console.log("Fetched Users:", users);

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found for this role" });
    }

    res.json(users);
  } catch (error) {
    console.error("Error fetching users by role:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/submit-request", async (req, res) => {
  try {
    const requestData = req.body;
    if (!mongoose.Types.ObjectId.isValid(requestData.Obj_id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }
    requestData.Obj_id = new mongoose.Types.ObjectId(requestData.Obj_id);


    // Ensure submissionDate and date are converted properly
    requestData.submissionDate = new Date(requestData.submissionDate);
    requestData.date = new Date(requestData.date);

    // Convert distance to a number (removing 'km' if present)
    if (typeof requestData.distance === "string") {
      requestData.distance = parseFloat(requestData.distance.replace(/\D/g, "")); // Extract numbers
    }

    console.log("Received Request Data:", requestData);

    if (typeof requestData !== "object" || Array.isArray(requestData)) {
      return res.status(400).json({ error: "Invalid request format" });
    }

    // ✅ Check if a similar request already exists (Same student, industry, and date)
    const existingRequest = await Request.findOne({
      studentName: requestData.studentName,
      industry: requestData.industry,
      date: requestData.date, // Check visit date to prevent duplicates
    });

    if (existingRequest) {
      return res.status(409).json({ error: "Duplicate request already exists!" });
    }

    // ✅ Save request to MongoDB only if it's not duplicate
    const newRequest = new  Request(requestData);
    await newRequest.save();

    res.status(201).json({ message: "Request submitted successfully!" });
  } catch (error) {
    console.error("Error submitting request:", error);
    res.status(500).json({ error: "Failed to submit request." });
  }
});

// 1️⃣ Insert or Update User Profile
router.post(
  "/updateProfile",
  upload.single("profileImage"),
  async (req, res) => {
    const { name, studentID, branch, email, phone } = req.body;

    try {
      let user = await Profile.findOne({ email });

      let profileImage = req.file
        ? `/uploads/${req.file.filename}`
        : user?.profileImage || null; // Keep old image if no new image uploaded

      if (user) {
        // Update existing user
        user.name = name;
        if (studentID) user.studentID = studentID;
        user.branch = branch;
        user.phone = phone;
        user.profileImage = profileImage;

        await user.save();
        return res.json({ message: "Profile updated successfully", user });
      } else {
        // Create new user
        const newUser = new Profile({
          name,
          studentID: studentID || null,
          branch,
          email,
          phone,
          profileImage,
        });

        await newUser.save();
        return res.json({
          message: "Profile created successfully",
          user: newUser,
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.get("/getProfile/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const user = await Profile.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      name: user.name,
      studentID: user.studentID,
      branch: user.branch, // Department
      phone: user.phone,
      profileImage: user.profileImage
        ? `http://${IP}:5000${user.profileImage}`
        : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/requests/students", async (req, res) => {
  try {
    const studentRequests = await Request.find().populate("Obj_id", "email fullName"); // Populate email from Register model
    res.status(200).json(studentRequests);
  } catch (error) {
    console.error("Error fetching student requests:", error);
    res.status(500).json({ error: "Failed to fetch student requests" });
  }
});

// ✅ Fetch specific student request by user ID (`Obj_id`)
router.get("/request-details/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const userRequest = await Request.findOne({ Obj_id: userId }).sort({ submissionDate: -1 });

    if (!userRequest) {
      return res.status(404).json({ error: "No request found for this user" });
    }

    res.status(200).json(userRequest);
  } catch (error) {
    console.error("Error fetching request details:", error);
    res.status(500).json({ error: "Failed to fetch request" });
  }
});


// Export the router
module.exports = router;
