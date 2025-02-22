// db.js
const mongoose = require('mongoose');
// require('dotenv').config({ path: '../.env' }); // Load environment variables
require('dotenv').config(); // Automatically loads from the root directory
const uri = process.env.MONGODB_URI;
// const uri="mongodb+srv://akash:eq8LpDlTm4LNxeu0@cluster0.yvwv9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

if (!uri) {
    console.error("MONGODB_URI is not defined!");
    process.exit(1); // Exit if URI is not defined
}

// Connect to MongoDB
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Could not connect to MongoDB', err));

module.exports = mongoose; // Export mongoose for use in other files
