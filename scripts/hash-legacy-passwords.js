require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const users = await User.find().select('+password');
  let changed = 0;

  for (const u of users) {
    const pwd = String(u.password || '');
    if (pwd.startsWith('$2a$') || pwd.startsWith('$2b$') || pwd.startsWith('$2y$')) continue;

    u.password = await bcrypt.hash(pwd, 10);
    await u.save();
    changed++;
  }

  console.log(`Updated ${changed} users to bcrypt-hashed passwords`);
  await mongoose.disconnect();
  process.exit(0);
})();
