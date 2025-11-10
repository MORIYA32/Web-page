require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
var responseTime = require('response-time');

const connectDB = require('./config/database');
const bcrypt = require('bcrypt');

const User = require('./models/User');
const cookieParser = require('cookie-parser');
const { authenticate, requireAdmin } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles');
const contentRoutes = require('./routes/content');
const progressRoutes = require('./routes/progress');
const watchedRoutes = require('./routes/watched');
const adminSeriesRouter = require('./routes/adminSeries');

const app = express();
const PORT = process.env.PORT || 3000;

async function ensureAdminUser() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return;

  try {
    const email = ADMIN_EMAIL.toLowerCase();
    const plain = String(ADMIN_PASSWORD);
    let admin = await User.findOne({ email }).select('+password');

    if (!admin) {
      await User.create({
        email,
        username: 'admin',
        password: plain,
        role: 'admin'
      });
      console.log(`[Admin Seed] Admin user created: ${email}`);
      return;
    }

    let changed = false;

    if (admin.role !== 'admin') {
      admin.role = 'admin';
      changed = true;
    }

    const pwd = String(admin.password || '');
    const looksHashed = pwd.startsWith('$2a$') || pwd.startsWith('$2b$') || pwd.startsWith('$2y$');

    if (looksHashed) {
      const ok = await bcrypt.compare(plain, pwd);
      if (!ok) { admin.password = plain; changed = true; }
    } else {
      if (pwd !== plain) { admin.password = plain; changed = true; }
    }

    if (changed) {
      await admin.save();
      console.log('[Admin Seed] Admin user updated');
    } else {
      console.log('[Admin Seed] Admin user already exists and is up to date');
    }
  } catch (err) {
    console.error('[Admin Seed] Error creating/updating admin:', err.message);
  }
}

async function startServer() {
  try {
    await connectDB();
app.set('trust proxy', 1);
    app.use(cors());
    app.use(express.json());
    app.use(cookieParser());

    app.use(express.static('views'));
    app.use('/videos', authenticate, express.static(path.join(__dirname, 'videos')));

    app.use('/api/auth', authRoutes);
    app.use('/api/profiles', authenticate, profileRoutes);
    app.use('/api/content', contentRoutes);
    app.use('/api/progress', authenticate, progressRoutes);
    app.use('/api/watched', authenticate, watchedRoutes);
    app.use('/api/admin', authenticate, requireAdmin, adminSeriesRouter);

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

    app.get('/admin/add', authenticate, requireAdmin, (req, res) => {
      res.sendFile(path.join(__dirname, 'views', 'admin-add.html'));
    });

    app.use((err, req, res, next) => {
      console.error('Error:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    });

    app.use('*', (req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });

    app.listen(PORT, () => {
      console.log(`Server running on 🚀 http://localhost:${PORT}`);
      console.log(`Serving static files from views`);
      Promise.resolve().then(() => ensureAdminUser());
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
