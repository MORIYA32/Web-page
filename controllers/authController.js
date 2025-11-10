const User = require("../models/User");
const jwt = require("jsonwebtoken"); // for JWT signing
const { info, warn, error } = require("../utils/logger");
const bcrypt = require("bcrypt");

class AuthController {
  async register(req, res) {
    try {
      const { email, username, password } = req.body;

      // Validation
      if (!email || !username || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      // Username length validation
      if (username.trim().length < 3) {
        return res
          .status(400)
          .json({ error: "Username must be at least 3 characters" });
      }

      // Password length validation
      if (password.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters" });
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username }],
      });

      if (existingUser) {
        if (existingUser.email === email.toLowerCase()) {
          return res.status(400).json({ error: "Email already registered" });
        }
        if (existingUser.username === username) {
          return res.status(400).json({ error: "Username already taken" });
        }
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = await User.create({
        email: email.toLowerCase(),
        username: username.trim(),
        password: hashedPassword,
        passwordEncrypted: true,
      });

      info("New user registered", {
        userId: newUser._id,
        email: newUser.email,
        username: newUser.username,
      });

      res.status(201).json({
        message: "Registration successful",
        user: {
          id: newUser._id,
          email: newUser.email,
          username: newUser.username,
        },
      });
    } catch (err) {
      error("Registration error", { error: err.message });
      res.status(500).json({ error: "Registration failed" });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      // Find user
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      let isMatch = false;
      if (user.passwordEncrypted) {
        isMatch = await bcrypt.compare(password, user.password);
      } else {
        isMatch = password === user.password;
      }

      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      info("User logged in", {
        userId: user._id,
        email: user.email,
        username: user.username,
      });

      //  Sign JWT and set as httpOnly cookie (7 days)
      const token = jwt.sign(
        {
          id: user._id.toString(),
          email: user.email,
          role: user.role || "user",
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("auth", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // set true in production behind HTTPS
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      const redirectUrl = user.role === "admin" ? "/admin/add" : "/profiles";

      res.json({
        message: "Login successful",
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        redirectUrl,
      });
    } catch (err) {
      error("Login error:", err.message);
      res.status(500).json({ error: "Login failed" });
    }
  }

  //  Return the current user (from JWT cookie)
  async whoami(req, res) {
    try {
      const token = req.cookies?.auth;
      if (!token) return res.json({ user: null });
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      return res.json({
        user: { id: payload.id, email: payload.email, role: payload.role },
      });
    } catch {
      return res.json({ user: null });
    }
  }

  // NEW: Clear the auth cookie
  async logout(req, res) {
    try {
      res.clearCookie("auth", { path: "/" });
      return res.json({ message: "Logged out" });
    } catch {
      return res.json({ message: "Logged out" });
    }
  }

  async deleteUser(req, res) {
    try {
      const { userId, username, password } = req.body;

      // Validation
      if (!userId || !username || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Find user
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.username !== username) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      let isPasswordMatch = false;
      if (user.passwordEncrypted) {
        isPasswordMatch = await bcrypt.compare(password, user.password);
      } else {
        isPasswordMatch = password === user.password;
      }

      if (!isPasswordMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Delete user and associated profiles
      const Profile = require("../models/Profile");
      await Profile.deleteMany({ userId });
      await User.findByIdAndDelete(userId);

      info("User deleted", {
        userId: user._id,
        email: user.email,
        username: user.username,
      });

      res.json({ message: "User account deleted successfully" });
    } catch (err) {
      error("Delete user error:", err);
      res.status(500).json({ error: "Failed to delete user account" });
    }
  }
}

module.exports = new AuthController();
