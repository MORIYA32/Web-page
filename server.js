require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
var responseTime = require('response-time')

const connectDB = require('./config/database');

//  required for admin seeding
const User = require('./models/User');

//  read JWT cookie
const cookieParser = require('cookie-parser');

//  auth middlewares (must exist in ./middleware/auth.js)
const { authenticate, requireAdmin } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles');
const contentRoutes = require('./routes/content');
const progressRoutes = require('./routes/progress');
const adminSeriesRouter = require('./routes/adminSeries'); // <— הוספתי את זה

const app = express();
const PORT = process.env.PORT || 3000;

// Function to ensure an admin user exists (seeding)
async function ensureAdminUser() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn('[Admin Seed] Missing ADMIN_EMAIL/ADMIN_PASSWORD in .env');
    return;
  }

  try {
    let admin = await User.findOne({ email: ADMIN_EMAIL });
    if (!admin) {
      await User.create({
        email: ADMIN_EMAIL,
        username: 'Admin',
        password: ADMIN_PASSWORD, // For learning/demo only (plain text)
        role: 'admin'
      });
      console.log(`[Admin Seed] Admin user created: ${ADMIN_EMAIL}`);
    } else {
      let changed = false;
      if (admin.role !== 'admin') { admin.role = 'admin'; changed = true; }
      if (ADMIN_PASSWORD && admin.password !== ADMIN_PASSWORD) { admin.password = ADMIN_PASSWORD; changed = true; }
      if (changed) { await admin.save(); console.log('[Admin Seed] Existing admin user updated'); }
      else { console.log('[Admin Seed] Admin user already exists and is up to date'); }
    }
  } catch (err) {
    console.error('[Admin Seed] Error creating/updating admin:', err.message);
  }
}

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

app.use(express.static('views'));

app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/progress', progressRoutes);

app.use('/api/admin', authenticate, requireAdmin, adminSeriesRouter);

// Serve static HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/profiles', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'profiles.html'));
});

app.get('/feed', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'feed.html'));
});

app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'settingsPage.html'));
});

// NEW: protected admin page – only for authenticated admins
app.get('/admin/add', authenticate, requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin-add.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Async startup function
async function startServer() {
  try {
    // Connect to MongoDB first
    await connectDB();
    console.log('MongoDB connected successfully');
    
    // Then seed admin user
    await ensureAdminUser();
    
    // Finally start the server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Serving static files from views`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Start the server
startServer();