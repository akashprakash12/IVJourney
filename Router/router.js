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
  Vote,
  Undertaking,
  TempVerification,
  VerifiedEmail 
} = require("../models/Items");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');
const { sendWelcomeEmail } = require("../context/emailService");
// At the top of your router.js or server file
const dns = require('dns');
const validator = require('validator');
const { sendVerificationEmail } = require("../context/emailverifie");


const IP = process.env.IP;



// Configure upload directories
const uploadDir = path.join(__dirname, "../uploads");
const studentSigDir = path.join(uploadDir, "student-signatures");
const parentSigDir = path.join(uploadDir, "parent-signatures");

// Create directories if they don't exist
[uploadDir, studentSigDir, parentSigDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure Multer storage for general uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

// Configure Multer storage for signatures
const signatureStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = '';
    if (file.fieldname === 'studentSignature') {
      folder = 'student-signatures';
    } else if (file.fieldname === 'parentSignature') {
      folder = 'parent-signatures';
    }
    cb(null, path.join(uploadDir, folder));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Initialize Multer instances
const upload = multer({ storage });
const uploadSignatures = multer({ 
  storage: signatureStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Helper functions
function calculateAverageRating(reviews) {
  return reviews.length 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;
}

function formatReview(review) {
  return {
    ...review,
    user: {
      ...review.user,
      profileImage: review.user.profileImage
        ? `http://${IP}:5000${review.user.profileImage}`
        : null
    }
  };
}

function formatPackage(package) {
  return {
    ...package.toObject(),
    image: package.image ? `http://${IP}:5000/uploads/${package.image}` : null,
    reviews: package.reviews.map(formatReview)
  };
}

// Routes
router.get("/", (req, res) => {
  res.send("Welcome to the IVJourney API!");
});

// PDF Upload
router.post("/upload-pdf", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const filePath = `/uploads/${req.file.filename}`;
  res.json({ filePath });
});

// Authentication
router.post("/Login", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
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
      role: user.role,
      userDetails: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        studentID: user.studentID || null,
        industryID: user.industryID || null,
        createdAt: user.createdAt,
      },
    });
  } catch (_error) {
    res.status(500).json({ _error: "Internal server error" });
  }
});

// Package Management
router.post("/packages", upload.single("image"), async (req, res) => {
  try {
    const price = Number(req.body.price);
    const activities = req.body.activities ? JSON.parse(req.body.activities) : [];
    const inclusions = Array.isArray(req.body.inclusions) ? req.body.inclusions : [req.body.inclusions];

    let existingPackage = await Package.findOne({ packageName: req.body.packageName });

    if (existingPackage) {
      if (req.file && existingPackage.image) {
        const oldImagePath = path.join(__dirname, "../uploads", existingPackage.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      existingPackage.description = req.body.description;
      existingPackage.duration = req.body.duration;
      existingPackage.price = price;
      existingPackage.activities = activities;
      existingPackage.inclusions = inclusions;
      existingPackage.instructions = req.body.instructions;
      
      if (req.file) {
        existingPackage.image = path.basename(req.file.path);
      }

      await existingPackage.save();
      return res.status(200).json({ message: "Package updated successfully!", package: existingPackage });
    }

    const newPackage = new Package({
      packageName: req.body.packageName,
      description: req.body.description,
      duration: req.body.duration,
      price: price,
      activities: activities,
      inclusions: inclusions,
      instructions: req.body.instructions,
      image: req.file ? path.basename(req.file.path) : null,
      votes: 0,
      votePercentage: 0,
    });

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

    const formattedPackages = packages.map((pkg) => {
      const imageUrl = pkg.image ? `http://${IP}:5000/uploads/${pkg.image}` : null;
      return {
        label: pkg.packageName,
        value: pkg._id,
        ...pkg._doc,
        image: imageUrl,
      };
    });

    res.status(200).json(formattedPackages);
  } catch (error) {
    console.error("Error fetching packages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/packages/:packageId", async (req, res) => {
  try {
    const { packageId } = req.params;
    const package = await Package.findById(packageId);

    if (!package) {
      return res.status(404).json({ error: "Package not found." });
    }

    const imageUrl = package.image ? `http://${IP}:5000/uploads/${package.image}` : null;
    const formattedPackage = {
      ...package._doc,
      image: imageUrl,
    };

    res.status(200).json(formattedPackage);
  } catch (error) {
    console.error("Error fetching package:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Feedback Management
router.post("/packages/:packageId/feedback", async (req, res) => {
  const { packageId } = req.params;
  const { userId, rating, comment, name } = req.body;

  if (!userId || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ 
      error: "Rating (1-5 stars) and valid userId are required",
      code: "MISSING_REQUIRED_FIELDS"
    });
  }

  try {
    const [package, user] = await Promise.all([
      Package.findById(packageId),
      Register.findById(userId).populate('profile')
    ]);

    if (!package) return res.status(404).json({ error: "Package not found" });
    if (!user) return res.status(404).json({ error: "User not found" });

    const existingReview = package.reviews.find(r => r.userId.toString() === userId);
    if (existingReview) {
      return res.status(409).json({
        error: "You've already reviewed this package",
        existingReview
      });
    }

    const newReview = {
      userId: user._id,
      fullName: name || user.fullName,
      rating: Number(rating),
      date: new Date(),
      user: {
        _id: user._id,
        fullName: name || user.fullName,
        profileImage: user.profile?.profileImage || null
      },
      ...(comment && { comment: comment.trim() })
    };

    package.reviews.push(newReview);
    package.rating = calculateAverageRating(package.reviews);
    await package.save();

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      review: newReview
    });

  } catch (error) {
    console.error("Feedback submission error:", error);
    return res.status(500).json({
      error: "Internal server error",
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

router.put("/packages/:packageId/feedback/:reviewId", async (req, res) => {
  try {
    const { packageId, reviewId } = req.params;
    const { userId, rating, comment, name } = req.body;

    if (!userId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: "Rating (1-5 stars) and valid userId are required",
        code: "MISSING_REQUIRED_FIELDS"
      });
    }

    const package = await Package.findById(packageId);
    if (!package) {
      return res.status(404).json({ 
        error: "Package not found",
        code: "PACKAGE_NOT_FOUND"
      });
    }

    const reviewIndex = package.reviews.findIndex(
      r => r._id.toString() === reviewId && r.userId.toString() === userId
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ 
        error: "Review not found or not owned by user",
        code: "REVIEW_NOT_FOUND"
      });
    }

    package.reviews[reviewIndex].rating = rating;
    package.reviews[reviewIndex].comment = comment;
    package.reviews[reviewIndex].fullName = name || package.reviews[reviewIndex].fullName;
    package.reviews[reviewIndex].date = new Date();

    package.rating = calculateAverageRating(package.reviews);

    await package.save();

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      package: formatPackage(package)
    });

  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ 
      error: "Internal server error",
      code: "SERVER_ERROR"
    });
  }
});

router.delete("/packages/:packageId/feedback/:reviewId", async (req, res) => {
  try {
    const { packageId, reviewId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        error: "Valid userId is required",
        code: "MISSING_REQUIRED_FIELDS"
      });
    }

    const package = await Package.findById(packageId);
    if (!package) {
      return res.status(404).json({ 
        error: "Package not found",
        code: "PACKAGE_NOT_FOUND"
      });
    }

    const reviewIndex = package.reviews.findIndex(
      r => r._id.toString() === reviewId && r.userId.toString() === userId
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ 
        error: "Review not found or not owned by user",
        code: "REVIEW_NOT_FOUND"
      });
    }

    package.reviews.splice(reviewIndex, 1);

    package.rating = package.reviews.length > 0 
      ? package.reviews.reduce((sum, r) => sum + r.rating, 0) / package.reviews.length
      : 0;

    await package.save();

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      package: formatPackage(package)
    });

  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ 
      error: "Internal server error",
      code: "SERVER_ERROR"
    });
  }
});

// Voting System
router.post("/packages/vote", async (req, res) => {
  const { studentId, packageId } = req.body;

  try {
    const existingVote = await Vote.findOne({ studentId });
    if (existingVote) {
      return res.status(400).json({ message: "You have already voted." });
    }

    const newVote = new Vote({ studentId, packageId });
    await newVote.save();

    const pkg = await Package.findById(packageId);
    pkg.votes += 1;
    await pkg.save();

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

// User Registration
router.post("/register", async (req, res) => {
  try {
    const { fullName, userName, phone, email, password, role, gender } = req.body;

    // 1. Validate required fields
    if (!fullName || !userName || !phone || !email || !password || !role || !gender) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // 2. Validate gender
    const validGenders = ["Male", "Female", "Other"];
    if (!validGenders.includes(gender)) {
      return res.status(400).json({ error: "Invalid gender value." });
    }

    // 3. Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        error: "Please enter a valid email address", 
        field: "email" 
      });
    }

    // 4. Validate email domain (only in production)
    if (process.env.NODE_ENV === 'production') {
      const domain = email.split('@')[1];
      try {
        await dns.promises.resolveMx(domain);
      } catch (err) {
        return res.status(400).json({ 
          error: "We don't accept emails from this provider", 
          field: "email" 
        });
      }
    }

    // 5. Check for existing user
    const existingUser = await Register.findOne({
      $or: [{ userName }, { phone }, { email }],
    });

    if (existingUser) {
      if (existingUser.userName === userName) {
        return res.status(400).json({ 
          error: "Username already exists", 
          field: "userName" 
        });
      }
      if (existingUser.phone === phone) {
        return res.status(400).json({ 
          error: "Phone number already in use", 
          field: "phone" 
        });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ 
          error: "Email already registered", 
          field: "email" 
        });
      }
    }

    // 6. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 7. Prepare user data
    const userData = {
      fullName,
      userName,
      phone,
      email,
      password: hashedPassword,
      role,
      gender,
      emailVerified: false // Add email verification flag
    };

    // 8. Generate IDs based on role
    if (role === "Student") {
      userData.studentID = `STU-${Math.floor(10000 + Math.random() * 90000)}`;
    } else if (role === "Industry Representative") {
      userData.industryID = `IND-${Math.floor(10000 + Math.random() * 90000)}`;
    }

    const isVerified = await VerifiedEmail.exists({ email });
    if (!isVerified) {
      return res.status(400).json({ error: "Email not verified" });
    }

    // 9. Save user
    const newUser = new Register(userData);
    await newUser.save();

    // 10. Send welcome email (don't await to avoid blocking)
    sendWelcomeEmail(newUser.email, newUser.fullName, newUser.role)
      .catch(err => console.error('Email sending failed:', err));
    // Cleanup verified email record (optional)
    await VerifiedEmail.deleteOne({ email });

    // 11. Return success response
    res.status(201).json({ 
      success: true,
      message: "Registration successful! Please check your email.",
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error("Registration Error:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        error: `${field} already exists`, 
        field 
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ 
        error: messages.join(', '),
        fields: Object.keys(error.errors)
      });
    }

    // Generic server error
    res.status(500).json({ 
      error: "Registration failed. Please try again later." 
    });
  }
});
// In your backend routes
router.post('/send-verification', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if email already registered
    const existingUser = await Register.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
console.log(code);

    // Store in temporary collection
    await TempVerification.findOneAndUpdate(
      { email },
      { code, expiresAt, attempts: 0 },
      { upsert: true, new: true }
    );

    // Send email
    await sendVerificationEmail(email, code);

    res.json({ success: true, message: "Verification code sent" });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ error: "Failed to send verification code" });
  }
});
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    // Find the verification record
    const verification = await TempVerification.findOne({ email });
    
    if (!verification) {
      return res.status(400).json({ error: "No verification request found" });
    }

    // Check attempts
    if (verification.attempts >= 3) {
      return res.status(429).json({ error: "Too many attempts" });
    }

    // Verify code
    if (verification.code !== code) {
      await TempVerification.updateOne(
        { email },
        { $inc: { attempts: 1 } }
      );
      return res.status(400).json({ error: "Invalid verification code" });
    }

    // Check expiry
    if (verification.expiresAt < new Date()) {
      return res.status(400).json({ error: "Verification code expired" });
    }

    // Mark as verified
    await VerifiedEmail.create({ email });
    await TempVerification.deleteOne({ email });

    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

// User Management
router.get("/api/register", async (req, res) => {
  try {
    const { role } = req.query;
    if (!role) {
      return res.status(400).json({ error: "Role parameter is required" });
    }

    const users = await Register.find({ role });
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found for this role" });
    }

    res.json(users);
  } catch (error) {
    console.error("Error fetching users by role:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Request Management
router.post("/submit-request", async (req, res) => {
  try {
    const requestData = req.body;

    if (!mongoose.Types.ObjectId.isValid(requestData.Obj_id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }
    requestData.Obj_id = new mongoose.Types.ObjectId(requestData.Obj_id);

    requestData.submissionDate = new Date(requestData.submissionDate).toISOString();
    requestData.date = new Date(requestData.date).toISOString();

    if (typeof requestData.distance === "string") {
      requestData.distance = parseFloat(requestData.distance.replace(/\D/g, ""));
    }

    const normalizedData = {
      studentName: requestData.studentName.trim().toLowerCase(),
      industry: requestData.industry.trim().toLowerCase(),
      date: new Date(requestData.date).toISOString(),
      email: requestData.email.trim().toLowerCase(),
    };

    const existingRequest = await Request.findOne(normalizedData);
    if (existingRequest) {
      return res.status(409).json({ error: "Duplicate request already exists!" });
    }

    const newRequest = new Request(requestData);
    await newRequest.save();

    res.status(201).json({ message: "Request submitted successfully!" });
  } catch (error) {
    console.error("Error submitting request:", error);
    res.status(500).json({ error: "Failed to submit request." });
  }
});

router.get("/requests/students", async (req, res) => {
  try {
    const studentRequests = await Request.find().populate("Obj_id", "email fullName");
    res.status(200).json(studentRequests);
  } catch (error) {
    console.error("Error fetching student requests:", error);
    res.status(500).json({ error: "Failed to fetch student requests" });
  }
});

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

    const validStatuses = ["Approved", "Rejected", "Pending"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updatedRequest = await Request.findOneAndUpdate(
      { Obj_id: requestId },
      { status },
      { new: true }
    );
    
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

// Profile Management
router.post("/updateProfile", upload.single("profileImage"), async (req, res) => {
  const { name, studentID, industryID, branch, email, phone } = req.body;

  try {
    let profile = await Profile.findOne({ email });
    let registerUser = await Register.findOne({ email });

    if (!profile) {
      profile = new Profile({
        name,
        studentID: studentID || null,
        industryID: industryID || null,
        branch,
        email,
        phone,
        profileImage: req.file ? `/uploads/${req.file.filename}` : null,
      });
      await profile.save();

      if (registerUser) {
        registerUser.profile = profile._id;
        await registerUser.save();
      }
    } else {
      if (req.file && profile.profileImage) {
        const oldImagePath = path.join(__dirname, "..", profile.profileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      profile.name = name;
      if (studentID) profile.studentID = studentID;
      if (industryID) profile.industryID = industryID;
      profile.branch = branch;
      profile.phone = phone;
      if (req.file) {
        profile.profileImage = `/uploads/${req.file.filename}`;
      }
      await profile.save();

      if (registerUser && !registerUser.profile) {
        registerUser.profile = profile._id;
        await registerUser.save();
      }
    }

    const updatedProfile = await Profile.findById(profile._id);
    res.json({ 
      message: "Profile updated successfully", 
      user: {
        ...updatedProfile.toObject(),
        profileImage: req.file 
          ? `${IP}${updatedProfile.profileImage}`
          : updatedProfile.profileImage
      }
    });
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
      branch: user.branch,
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

// Voting Analytics
router.get("/votes-details", async (req, res) => {
  try {
    const votes = await Vote.find()
      .populate({
        path: "studentId",
        model: "Register",
        select: "fullName gender studentID",
      })
      .lean();

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

    const uniqueStudentIds = [...new Set(votes.map((vote) => vote.studentId?._id?.toString()))];
    const totalStudents = uniqueStudentIds.length;

    res.json({
      votedUsers: votes,
      genderRatio,
      totalStudents,
    });
  } catch (error) {
    console.error("Error fetching votes:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// Undertaking Form Submission with Multer
router.post('/undertaking', 
  uploadSignatures.fields([
    { name: 'studentSignature', maxCount: 1 },
    { name: 'parentSignature', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const {
        studentName,
        semester,
        branch,
        rollNo,
        parentName,
        placesVisited,
        tourPeriod,
        facultyDetails
      } = req.body;

      const requiredFields = {
        studentName,
        semester,
        branch,
        rollNo,
        parentName,
        placesVisited,
        tourPeriod,
        facultyDetails
      };

      for (const [field, value] of Object.entries(requiredFields)) {
        if (!value) {
          if (req.files) {
            Object.values(req.files).forEach(files => {
              files.forEach(file => {
                fs.unlinkSync(file.path);
              });
            });
          }
          return res.status(400).json({ 
            error: `${field} is required`,
            field
          });
        }
      }

      const existing = await Undertaking.findOne({ rollNo });
      if (existing) {
        if (req.files) {
          Object.values(req.files).forEach(files => {
            files.forEach(file => {
              fs.unlinkSync(file.path);
            });
          });
        }
        return res.status(400).json({ 
          error: 'An undertaking already exists for this roll number',
          rollNo
        });
      }

      const studentSigPath = req.files.studentSignature 
        ? `/uploads/student-signatures/${req.files.studentSignature[0].filename}`
        : null;
      
      const parentSigPath = req.files.parentSignature 
        ? `/uploads/parent-signatures/${req.files.parentSignature[0].filename}`
        : null;

      const undertaking = new Undertaking({
        studentName,
        semester,
        branch,
        rollNo,
        parentName,
        placesVisited,
        tourPeriod,
        facultyDetails,
        studentSignature: studentSigPath,
        parentSignature: parentSigPath
      });

      await undertaking.save();

      res.status(201).json({
        success: true,
        message: 'Undertaking submitted successfully',
        data: undertaking
      });

    } catch (error) {
      console.error('Error submitting undertaking:', error);
      
      if (req.files) {
        Object.values(req.files).forEach(files => {
          files.forEach(file => {
            fs.unlinkSync(file.path);
          });
        });
      }

      res.status(500).json({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

module.exports = router;