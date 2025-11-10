const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      index: true
    }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(String(this.password), 10);
  next();
});

userSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() || {};
  if (update.password) {
    update.password = await bcrypt.hash(String(update.password), 10);
    this.setUpdate(update);
  } else if (update.$set && update.$set.password) {
    update.$set.password = await bcrypt.hash(String(update.$set.password), 10);
    this.setUpdate(update);
  }
  next();
});

userSchema.methods.verifyPassword = function (plain) {
  return bcrypt.compare(String(plain), this.password);
};

module.exports = mongoose.model('User', userSchema);
