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
  VerifiedEmail,
  VerifiedPhone
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
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
const client = require('twilio')(accountSid, authToken); 

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
    const normalizedPhone = phone.replace(/\D/g, '');
    const normalizedEmail = email.toLowerCase();

    // Validate required fields
    const requiredFields = { fullName, userName, phone, email, password, role, gender };
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        return res.status(400).json({ 
          error: `${field} is required`,
          field
        });
      }
    }

    // Validate email format
    if (!validator.isEmail(normalizedEmail)) {
      return res.status(400).json({ 
        error: "Invalid email format",
        field: "email"
      });
    }

    // Check for existing user
    const existingUser = await Register.findOne({
      $or: [
        { userName },
        { phone: normalizedPhone },
        { email: normalizedEmail }
      ]
    });

    if (existingUser) {
      const conflicts = [];
      if (existingUser.userName === userName) conflicts.push("username");
      if (existingUser.phone === normalizedPhone) conflicts.push("phone");
      if (existingUser.email === normalizedEmail) conflicts.push("email");
      
      return res.status(400).json({ 
        error: "User already exists",
        conflicts
      });
    }

    // Check verifications
    const [emailVerified, phoneVerified] = await Promise.all([
      VerifiedEmail.findOne({ email: normalizedEmail }),
      VerifiedPhone.findOne({ phone: normalizedPhone })
    ]);

    if (!emailVerified) {
      return res.status(400).json({ 
        error: "Email not verified",
        field: "email"
      });
    }

    if (!phoneVerified) {
      return res.status(400).json({ 
        error: "Phone number not verified",
        field: "phone"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await Register.create({
      fullName,
      userName,
      phone: normalizedPhone,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      gender,
      emailVerified: true,
      phoneVerified: true
    });

    // Send welcome email
    sendWelcomeEmail(newUser.email, newUser.fullName, newUser.role)
      .catch(err => console.error('Email sending failed:', err));

    // Cleanup verification records
    await Promise.all([
      VerifiedEmail.deleteOne({ email: normalizedEmail }),
      VerifiedPhone.deleteOne({ phone: normalizedPhone })
    ]);

    res.status(201).json({ 
      success: true,
      message: "Registration successful",
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        error: `${field} already exists`,
        field 
      });
    }

    res.status(500).json({ 
      error: "Registration failed",
      details: error.message 
    });
  }
});
// In your backend routes
router.post('/send-email-verification', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        error: "Invalid email format",
        field: "email"
      });
    }

    // Check if email already registered
    const existingUser = await Register.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: "Email already registered",
        field: "email"
      });
    }

    // Check if already verified (prevent duplicate verification)
    const isAlreadyVerified = await VerifiedEmail.exists({ email });
    if (isAlreadyVerified) {
      return res.status(400).json({
        error: "Email already verified",
        field: "email"
      });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store in temporary collection
    await TempVerification.updateOne(
      { email },
      { 
        $set: {
          email,
          code,
          expiresAt,
          attempts: 0
        },
        $unset: {
          phone: ""
        }
      },
      { upsert: true }
    );

    console.log('Verification code generated:', code);

    // Send email
    try {
      await sendVerificationEmail(email, code);
      console.log('Verification email sent successfully to:', email);
      return res.json({ 
        success: true, 
        message: "Verification code sent" 
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Clean up the verification record if email fails
      await TempVerification.deleteOne({ email });
      return res.status(500).json({ 
        error: "Failed to send verification email",
        details: emailError.message
      });
    }

  } catch (error) {
    console.error("Verification error:", error);
    
    // Handle duplicate key errors specifically
    if (error.code === 11000) {
      return res.status(400).json({
        error: "Verification already requested",
        solution: "Wait 15 minutes or use the code already sent"
      });
    }
    
    res.status(500).json({ 
      error: "Failed to process verification request",
      details: error.message 
    });
  }
});

router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    // Basic validation
    if (!email || !code) {
      return res.status(400).json({ 
        error: "Email and code are required",
        fields: ["email", "code"]
      });
    }

    // Find the verification record
    const verification = await TempVerification.findOne({ email });
    
    if (!verification) {
      return res.status(400).json({ 
        error: "No verification request found",
        solution: "Request a new verification code"
      });
    }

    // Check attempts
    if (verification.attempts >= 3) {
      return res.status(429).json({ 
        error: "Too many attempts",
        solution: "Please request a new code"
      });
    }

    // Verify code
    if (verification.code !== code) {
      await TempVerification.updateOne(
        { email },
        { $inc: { attempts: 1 } }
      );
      const remainingAttempts = 3 - (verification.attempts + 1);
      return res.status(400).json({ 
        error: "Invalid verification code",
        details: `${remainingAttempts} attempts remaining`
      });
    }

    // Check expiry
    if (verification.expiresAt < new Date()) {
      return res.status(400).json({ 
        error: "Verification code expired",
        solution: "Request a new code"
      });
    }

    // Mark as verified - using updateOne with upsert to prevent duplicates
    await VerifiedEmail.updateOne(
      { email },
      { $set: { email, verifiedAt: new Date() } },
      { upsert: true }
    );

    // Clean up temporary verification
    await TempVerification.deleteOne({ email });

    res.json({ 
      success: true, 
      message: "Email verified successfully",
      email
    });

  } catch (error) {
    console.error("Email verification error:", error);
    
    // Handle duplicate key errors specifically
    if (error.code === 11000) {
      return res.status(400).json({
        error: "Email already verified",
        solution: "You can proceed to login"
      });
    }
    
    res.status(500).json({ 
      error: "Email verification failed",
      details: error.message 
    });
  }
});
// Send phone verification code

router.post('/send-phone-verification', async (req, res) => {
  try {
    const { phone } = req.body;
    const normalizedPhone = phone.replace(/\D/g, '');

    // Validate phone number
    if (!/^\d{10}$/.test(normalizedPhone)) {
      return res.status(400).json({ 
        error: "Invalid phone number",
        details: "Must be 10 digits without country code"
      });
    }

    // Check if phone already registered
    const existingUser = await Register.findOne({ phone: normalizedPhone });
    if (existingUser) {
      return res.status(400).json({ 
        error: "Phone number already registered",
        field: "phone"
      });
    }

    // Generate verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    // Store verification data
    await TempVerification.updateOne(
      { phone: normalizedPhone },
      {
        $set: {
          phone: normalizedPhone,
          code,
          expiresAt,
          attempts: 0
        },
        $unset: { email: "" }
      },
      { upsert: true }
    );

    // Send SMS in production
    if (process.env.NODE_ENV === 'production') {
      try {
        const message = await client.messages.create({
          body: `Your verification code is: ${code}`,
          from: twilioPhone,
          to: `+91${normalizedPhone}`
        });
        console.log('SMS sent:', message.sid);
      } catch (error) {
        console.error('Twilio error:', error);
        return res.status(500).json({ 
          error: "Failed to send SMS",
          details: error.message
        });
      }
    } else {
      console.log(`[DEV] Verification code for ${normalizedPhone}: ${code}`);
    }

    res.json({ 
      success: true, 
      message: "Verification code sent"
    });

  } catch (error) {
    console.error("Phone verification error:", error);
    res.status(500).json({ 
      error: "Failed to process verification request",
      details: error.message 
    });
  }
});

// Verify phone code
// Verify Phone Code
router.post('/verify-phone', async (req, res) => {
  try {
    const { phone, code } = req.body;
    const normalizedPhone = phone.replace(/\D/g, '');

    // Validate input
    if (!normalizedPhone || !code) {
      return res.status(400).json({ error: "Phone and code are required" });
    }

    // Find verification record
    const verification = await TempVerification.findOne({ phone: normalizedPhone });
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
        { phone: normalizedPhone },
        { $inc: { attempts: 1 } }
      );
      return res.status(400).json({ error: "Invalid verification code" });
    }

    // Check expiry
    if (verification.expiresAt < new Date()) {
      return res.status(400).json({ error: "Verification code expired" });
    }

    // Mark as verified
    await VerifiedPhone.updateOne(
      { phone: normalizedPhone },
      { $set: { phone: normalizedPhone, verifiedAt: new Date() } },
      { upsert: true }
    );

    // Cleanup
    await TempVerification.deleteOne({ phone: normalizedPhone });

    res.json({ 
      success: true, 
      message: "Phone number verified successfully"
    });

  } catch (error) {
    console.error("Phone verification error:", error);
    res.status(500).json({ 
      error: "Phone verification failed",
      details: error.message 
    });
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
// In your routes file
router.get("/check-request/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Checking request for Object ID:", id);

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        error: "Invalid Object ID format",
        exists: false
      });
    }

    const existingRequest = await Request.findOne({
      Obj_id: new mongoose.Types.ObjectId(id),  // Use the id from params directly
      status: { $in: ["Pending", "Approved"] }  // Match your schema's enum case
    });

    console.log("Found Request:", existingRequest);
    res.json({ 
      exists: !!existingRequest,
      request: existingRequest || null
    });
  } catch (error) {
    console.error("Check request error:", error);
    res.status(500).json({ 
      error: "Server error while checking request",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
      exists: false
    });
  }
});

router.post("/submit-request", async (req, res) => {
  try {
    const requestData = req.body;
    console.log("Received request data:", requestData);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(requestData.Obj_id)) {
      return res.status(400).json({
        error: "Invalid student ID format"
      });
    }

    // Convert to ObjectId first
    requestData.Obj_id = new mongoose.Types.ObjectId(requestData.Obj_id);

    const requiredFields = [
      "Obj_id", "role", "email", "studentName", "department",
      "semester", "industry", "date", "studentsCount",
      "faculty", "transport", "packageDetails", "activity",
      "duration", "distance", "ticketCost", "driverPhoneNumber",
      "checklist"
    ];

    const missingFields = requiredFields.filter(field => {
      // Check if field is missing or empty string
      return requestData[field] === undefined || 
             requestData[field] === null || 
             (typeof requestData[field] === 'string' && requestData[field].trim() === '');
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "Missing required fields",
        missingFields
      });
    }

    // Type conversions
    requestData.studentsCount = parseInt(requestData.studentsCount);
    if (isNaN(requestData.studentsCount) || requestData.studentsCount <= 0) {
      return res.status(400).json({
        error: "Number of students must be a positive integer"
      });
    }

    requestData.distance = parseFloat(requestData.distance);
    requestData.ticketCost = parseFloat(requestData.ticketCost);
    requestData.date = new Date(requestData.date);
    requestData.submissionDate = new Date(requestData.submissionDate || Date.now());

    // Handle empty studentRep
    if (!requestData.studentRep || requestData.studentRep.trim() === '') {
      requestData.studentRep = "Not specified";
    }

    // Duplicate Check
    const existingRequest = await Request.findOne({
      Obj_id: requestData.Obj_id,
      status: { $in: ["pending", "approved"] }
    });

    if (existingRequest) {
      return res.status(409).json({
        error: "You have already submitted a request that is pending or approved.",
        existingId: existingRequest._id,
        status: existingRequest.status
      });
    }

    // Create new request
    const newRequest = new Request({
      ...requestData,
      status: "Pending" // Note the capital 'P' to match your enum
    });

    await newRequest.save();

    return res.status(201).json({
      success: true,
      message: "Request submitted successfully",
      requestId: newRequest._id
    });

  } catch (error) {
    console.error("Request submission error:", error);
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: "Validation failed",
        details: errors
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        error: "Invalid data format",
        details: error.message
      });
    }

    return res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
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
  const { name, studentID, industryID, branch, semester, email, phone } = req.body;

  // Validate required fields
  if (!name || !email || !phone) {
    return res.status(400).json({ message: "Name, email, and phone are required" });
  }

  try {
    // Find existing profile and register user
    const [profile, registerUser] = await Promise.all([
      Profile.findOne({ email }),
      Register.findOne({ email })
    ]);

    // Handle file upload if exists
    const profileImage = req.file 
      ? `/uploads/${req.file.filename}`
      : profile?.profileImage;

    // Prepare update data
    const updateData = {
      name,
      studentID: studentID || null,
      industryID: industryID || null,
      branch: branch || null,
      semester: semester || null, // Handle semester field
      phone,
      profileImage
    };

    // Update or create profile
    let updatedProfile;
    if (!profile) {
      // Create new profile
      updatedProfile = new Profile({
        ...updateData,
        email
      });
      await updatedProfile.save();

      // Link to register user if exists
      if (registerUser && !registerUser.profile) {
        registerUser.profile = updatedProfile._id;
        await registerUser.save();
      }
    } else {
      // Delete old image if new one is uploaded
      if (req.file && profile.profileImage) {
        const oldImagePath = path.join(__dirname, "..", profile.profileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Update existing profile
      updatedProfile = await Profile.findOneAndUpdate(
        { email },
        updateData,
        { new: true }
      );

      // Link to register user if not already linked
      if (registerUser && !registerUser.profile) {
        registerUser.profile = updatedProfile._id;
        await registerUser.save();
      }
    }

    // Prepare response
    const responseData = {
      message: "Profile updated successfully",
      user: {
        _id: updatedProfile._id,
        name: updatedProfile.name,
        email: updatedProfile.email,
        studentID: updatedProfile.studentID,
        industryID: updatedProfile.industryID,
        branch: updatedProfile.branch,
        semester: updatedProfile.semester, // Include semester in response
        phone: updatedProfile.phone,
        profileImage: updatedProfile.profileImage 
          ? `${IP}${updatedProfile.profileImage}`
          : null,
        role: registerUser?.role // Include role if available
      }
    };

    res.json(responseData);
  } catch (error) {
    console.error("Error updating profile:", error);
    
    // Clean up uploaded file if error occurred
    if (req.file) {
      const filePath = path.join(__dirname, "../uploads", req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({ 
      message: "Error updating profile",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
      semester:user.semester,
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
    const votes = await Vote.find({ studentId: { $ne: null } }) // Only find votes with non-null studentId
      .populate({
        path: "studentId",
        model: "Register",
        select: "fullName gender studentID",
      })
      .lean();

    let maleCount = 0;
    let femaleCount = 0;
    const validVotes = votes.filter(vote => vote.studentId); // Filter out votes where populate failed

    validVotes.forEach((vote) => {
      if (vote.studentId.gender === "Male") maleCount++;
      if (vote.studentId.gender === "Female") femaleCount++;
    });

    const total = maleCount + femaleCount;

    const genderRatio = {
      malePercentage: total ? (maleCount / total) * 100 : 0,
      femalePercentage: total ? (femaleCount / total) * 100 : 0,
      maleCount,
      femaleCount,
    };

    const uniqueStudentIds = [...new Set(validVotes.map(vote => vote.studentId._id.toString()))];
    const totalStudents = uniqueStudentIds.length;

    res.json({
      votedUsers: validVotes, // Only send valid votes
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