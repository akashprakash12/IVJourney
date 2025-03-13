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
  Request,
  Profile,
  Vote
} = require("../models/Items"); // Import the Item model
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const IP = process.env.IP;
console.log(IP);

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
    const filePath = path.join(uploadDir, file.originalname);

    // ✅ Check if the file already exists
    if (fs.existsSync(filePath)) {
      console.log("File already exists, reusing:", file.originalname);
      cb(null, file.originalname); // Use the existing filename
    } else {
      console.log("Saving new file:", file.originalname);
      cb(null, file.originalname); // Save with original filename (no timestamp)
    }
  },
});

const upload = multer({ storage });

router.get("/", (req, res) => {
  res.send("Welcome to the IVJourney API!");
});

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
    console.log("Received Data:", req.body); 
    console.log("Received File:", req.file); 

    const price = Number(req.body.price);
    const activities = req.body.activities ? JSON.parse(req.body.activities) : [];
    const inclusions = Array.isArray(req.body.inclusions) ? req.body.inclusions : [req.body.inclusions];

    let existingPackage = await Package.findOne({ packageName: req.body.packageName });

    if (existingPackage) {
      // If a new image is uploaded, delete the old image
      if (req.file && existingPackage.image) {
        const oldImagePath = path.join(__dirname, "../", existingPackage.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath); // Delete old image
        }
      }

      // Update existing package
      existingPackage.description = req.body.description;
      existingPackage.duration = req.body.duration;
      existingPackage.price = price;
      existingPackage.activities = activities;
      existingPackage.inclusions = inclusions;
      existingPackage.instructions=req.body.instructions;
      
      if (req.file) {
        existingPackage.image = req.file.path; // Update image only if new file is uploaded
      }

      await existingPackage.save();
      return res.status(200).json({ message: "Package updated successfully!", package: existingPackage });
    }

    // Create new package if it doesn't exist
    const newPackage = new Package({
      packageName: req.body.packageName,
      description: req.body.description,
      duration: req.body.duration,
      price: price,
      activities: activities,
      inclusions: inclusions,
      instructions:req.body.instructions,
      image: req.file ? req.file.path : null,
      votes: 0, // Initialize votes to 0
      votePercentage: 0, 
    });

    console.log("New Package:", newPackage);

    await newPackage.save();
    res.status(201).json({ message: "Package saved successfully!", package: newPackage });
  } catch (error) {
    console.error("Error saving package:", error);
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
      label: pkg.packageName, // ✅ Name for dropdowns
      value: pkg._id, // ✅ Unique identifier
      ...pkg._doc, // ✅ Include other fields
      image: pkg.image ? `http://${IP}:5000/uploads/${path.basename(pkg.image)}` : null, // ✅ Send correct image URL
    }));

    res.status(200).json(formattedPackages);
  } catch (error) {
    console.error("Error fetching packages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to handle voting
router.post("/packages/vote", async (req, res) => {
  const { studentId, packageId } = req.body;

  try {
    // Check if the student has already voted
    const existingVote = await Vote.findOne({ studentId });
    if (existingVote) {
      return res.status(400).json({ message: "You have already voted." });
    }

    // Save the vote
    const newVote = new Vote({ studentId, packageId });
    await newVote.save();

    // Update the package's vote count
    const pkg = await Package.findById(packageId);
    pkg.votes += 1;
    await pkg.save();

    // Calculate vote percentages for all packages
    const allPackages = await Package.find();
    const totalVotes = allPackages.reduce((sum, pkg) => sum + pkg.votes, 0);

    for (const pkg of allPackages) {
      pkg.votePercentage = totalVotes > 0 ? (pkg.votes / totalVotes) * 100 : 0;
      await pkg.save();
    }

    res.status(200).json({ message: "Vote recorded successfully." });
  } catch (error) {
    console.error("Error recording vote:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});
router.post("/register", async (req, res) => {
  try {
    const { fullName, userName, phone, email, password, role, gender } = req.body;

    // Validate required fields
    if (!fullName || !userName || !phone || !email || !password || !role || !gender) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Validate gender (optional, since enum in schema will handle it)
    const validGenders = ["Male", "Female", "Other"];
    if (!validGenders.includes(gender)) {
      return res.status(400).json({ error: "Invalid gender value." });
    }

    // Check if username, phone, or email already exists
    const existingUser = await Register.findOne({
      $or: [{ userName }, { phone }, { email }],
    });

    if (existingUser) {
      if (existingUser.userName === userName) {
        return res.status(400).json({ error: "Username already exists.", field: "userName" });
      }
      if (existingUser.phone === phone) {
        return res.status(400).json({ error: "Phone number already in use.", field: "phone" });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ error: "Email already in use.", field: "email" });
      }
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
      gender,
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

    // Handle duplicate key errors (e.g., duplicate userName, phone, or email)
    if (error.code === 11000) {
      if (error.keyValue.userName) {
        return res.status(400).json({ error: "Username already exists.", field: "userName" });
      }
      if (error.keyValue.phone) {
        return res.status(400).json({ error: "Phone number already in use.", field: "phone" });
      }
      if (error.keyValue.email) {
        return res.status(400).json({ error: "Email already in use.", field: "email" });
      }
    }

    // Handle validation errors (e.g., invalid role or gender)
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }

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
router.post("/updateProfile", upload.single("profileImage"), async (req, res) => {
  const { name, studentID,industryID, branch, email, phone } = req.body;

  try {
    let user = await Profile.findOne({ email });

    if (!user) {
      // If user doesn't exist, create a new profile
      const newUser = new Profile({
        name,
        studentID: studentID || null,
        industryID:industryID|| null,
        branch,
        email,
        phone,
        profileImage: req.file ? `/uploads/${req.file.filename}` : null,
      });

      await newUser.save();
      return res.json({ message: "Profile created successfully", user: newUser });
    }

    // If a new image is uploaded, delete the old one
    if (req.file && user.profileImage) {
      const oldImagePath = path.join(__dirname, "..", user.profileImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath); // Delete the old image
      }
    }

    // Update user profile
    user.name = name;
    if (studentID) user.studentID = studentID;
    user.branch = branch;
    user.phone = phone;
    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`; // Save new image
    }

    await user.save();
    return res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

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

router.put("/request-status/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    console.log(requestId);
    

    // Ensure status is valid
    const validStatuses = ["Approved", "Rejected", "Pending"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // Update request status in MongoDB
    const updatedRequest = await Request.findOneAndUpdate(
      { Obj_id: requestId }, // Match Obj_id instead of _id
      { status },
      { new: true }
    );
    
    console.log(updatedRequest);
    

    if (!updatedRequest) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.status(200).json({ message: `Request marked as ${status}`, updatedRequest });
  } catch (error) {
    console.error("Error updating request status:", error);
    res.status(500).json({ error: "Failed to update request status" });
  }
});


router.delete("/request-status/:id", async (req, res) => {
  try {
    const requestId = req.params.id;
    console.log(requestId);
    
    // Find and delete the request
    const deletedRequest = await Request.findOneAndDelete({ Obj_id: new mongoose.Types.ObjectId(requestId) });

    if (!deletedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }
    
    res.status(200).json({ message: "Request deleted successfully" });
  } catch (error) {
    console.error("Error deleting request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET voted user details and gender ratio
router.get("/votes-details", async (req, res) => {
  try {
    console.log("Fetching Votes...");
    
    const votes = await Vote.find()
      .populate({
        path: "studentId",
        model: "Register",
        select: "fullName gender studentID",
      })
      .lean(); // ✅ Convert MongoDB documents to plain JSON for debugging

    console.log("Votes with Populated Data:", votes); // ✅ Check console output

    let maleCount = 0;
    let femaleCount = 0;

    votes.forEach((vote) => {
      if (vote.studentId?.gender === "Male") maleCount++;
      if (vote.studentId?.gender === "Female") femaleCount++;
    });

    const total = maleCount + femaleCount;
    const genderRatio = {
      malePercentage: total ? (maleCount / total) * 100 : 0,
      femalePercentage: total ? (femaleCount / total) * 100 : 0,
      maleCount,
      femaleCount,
    };

    res.json({ votedUsers: votes, genderRatio });
  } catch (error) {
    console.error("Error fetching votes:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// Export the router
module.exports = router;
