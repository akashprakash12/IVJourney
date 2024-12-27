// models/Item.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the schema
const ItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    
});
const userSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  });

// // Hash password before saving
// userSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) return next();
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   });
  
//   // Method to compare passwords
//   userSchema.methods.comparePassword = function (password) {
//     return bcrypt.compare(password, this.password);
//   };
  
  module.exports = {
    Item: mongoose.model('Item', ItemSchema), // Export the Item model
    User: mongoose.model('User', userSchema), // Export the User model
  };