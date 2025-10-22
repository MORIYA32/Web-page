const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    username: {
      type: String,
      required: true,   
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
// Role field for admin identification
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      index: true
    }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
