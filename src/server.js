// index.js
const express = require('express');
const cors = require('cors');
require('../DB/db'); // Import the database connection
const itemRoutes = require('../Router/router'); // Import the routes
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));


// Use the routes
app.use('/api', itemRoutes); // All item-related routes will have the `/api` prefix

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
