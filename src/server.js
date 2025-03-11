const express = require("express");
const cors = require("cors");
const path = require("path");
require("../DB/db"); // Import the database connection
const itemRoutes = require("../Router/router"); // Import the routes

const app = express();

// Middleware
app.use(cors({
  origin: "*", // Allow all origins (replace with your React Native app's URL in production)
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));


// Use the routes
app.use("/api", itemRoutes); // All item-related routes will have the `/api` prefix

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});