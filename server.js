require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const { info, warn, error } = require("./utils/logger");
var responseTime = require("response-time");

const connectDB = require("./config/database");

//  required for admin seeding
const User = require("./models/User");

//  read JWT cookie
const cookieParser = require("cookie-parser");

//  auth middlewares (must exist in ./middleware/auth.js)
const { authenticate, requireAdmin } = require("./middleware/auth");

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profiles");
const contentRoutes = require("./routes/content");
const progressRoutes = require("./routes/progress");
const watchedRoutes = require("./routes/watched");
const adminSeriesRouter = require("./routes/adminSeries"); // <— הוספתי את זה
const { url } = require("inspector");

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Function to ensure an admin user exists (seeding)
async function ensureAdminUser() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    warn("Missing ADMIN_EMAIL/ADMIN_PASSWORD in .env");
    return;
  }

  let changed = false;

  try {
    let admin = await User.findOne({ email: ADMIN_EMAIL });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

      await User.create({
        email: ADMIN_EMAIL,
        username: "Admin",
        password: hashedPassword,
        passwordEncrypted: true,
        role: "admin",
      });
      info("Admin user created", { email: ADMIN_EMAIL });
    } else {
      if (admin.role !== "admin") {
        admin.role = "admin";
        changed = true;
      }
      if (ADMIN_PASSWORD && !(await bcrypt.compare(ADMIN_PASSWORD, admin.password))) {
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(ADMIN_PASSWORD, salt);
        admin.passwordEncrypted = true;
        changed = true;
      }
      if (changed) {
        await admin.save();
        info("Existing Admin user updated", { email: ADMIN_EMAIL });
      } else {
        info("Admin user already exists and is up to date", {
          email: ADMIN_EMAIL,
        });
      }
    }
  } catch (err) {
    error("Error creating/updating admin", { error: err.message });
  }
}

// One-time admin seeding
ensureAdminUser();

// Middleware
app.use(cors());
app.use(express.json());

// NEW: parse cookies so we can read the JWT (auth cookie)
app.use(cookieParser());

// time metrics
// app.use(responseTime(function (req, res, time) {
//   var stat = (req.method + req.url).toLowerCase()
//     .replace(/[:.]/g, '')
//     .replace(/\//g, '_')
//   console.log(stat, time)
// }))

app.use(express.static("views"));
app.use(
  "/videos",
  authenticate,
  express.static(path.join(__dirname, "videos"))
);

app.use("/api/auth", authRoutes);
app.use("/api/profiles", authenticate, profileRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/progress", authenticate, progressRoutes);
app.use("/api/watched", authenticate, watchedRoutes);

app.use("/api/admin", authenticate, requireAdmin, adminSeriesRouter);

// Serve static HTML files
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "register.html"));
});

app.get("/profiles", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "profiles.html"));
});

app.get("/feed", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "feed.html"));
});

app.get("/settings", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "settingsPage.html"));
});

// NEW: protected admin page – only for authenticated admins
app.get("/admin/add", authenticate, requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, "views", "admin-add.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  error("Server error", { error: err.message });
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  info(`Server started`, { port: PORT, url: `http://localhost:${PORT}` });
});
