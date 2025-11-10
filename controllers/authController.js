const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class AuthController {
  async register(req, res) {
    try {
      const { email, username, password } = req.body || {};

      if (!email || !username || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      if (username.trim().length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username: username.trim() }]
      });
      if (existingUser) {
        if (existingUser.email === email.toLowerCase()) {
          return res.status(400).json({ error: 'Email already registered' });
        }
        if (existingUser.username === username.trim()) {
          return res.status(400).json({ error: 'Username already taken' });
        }
      }

      const newUser = await User.create({
        email: email.toLowerCase(),
        username: username.trim(),
        password
      });

      return res.status(201).json({
        message: 'Registration successful',
        user: {
          id: newUser._id,
          email: newUser.email,
          username: newUser.username,
          role: newUser.role || 'user'
        }
      });
    } catch (error) {
      return res.status(500).json({ error: 'Registration failed' });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body || {};

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const ok = await bcrypt.compare(String(password), String(user.password || ''));
      if (!ok) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign(
        { id: user._id.toString(), email: user.email, role: user.role || 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.cookie('auth', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
      });

      const redirectUrl = (user.role === 'admin') ? '/admin/add' : '/profiles';

      return res.json({
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role || 'user'
        },
        redirectUrl
      });
    } catch (error) {
      return res.status(500).json({ error: 'Login failed' });
    }
  }

  async whoami(req, res) {
    try {
      const token = req.cookies?.auth;
      if (!token) return res.json({ user: null });
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      return res.json({
        user: { id: payload.id, email: payload.email, role: payload.role }
      });
    } catch {
      return res.json({ user: null });
    }
  }

  async logout(req, res) {
    try {
      res.clearCookie('auth', { path: '/' });
      return res.json({ message: 'Logged out' });
    } catch {
      return res.json({ message: 'Logged out' });
    }
  }

  async deleteUser(req, res) {
    try {
      const { userId, username, password } = req.body || {};

      if (!userId || !username || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const user = await User.findById(userId).select('+password');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const nameOk = user.username === String(username).trim();
      const passOk = await bcrypt.compare(String(password), String(user.password || ''));
      if (!nameOk || !passOk) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const Profile = require('../models/Profile');
      await Profile.deleteMany({ userId });
      await User.findByIdAndDelete(userId);

      return res.json({ message: 'User account deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete user account' });
    }
  }
}

module.exports = new AuthController();
