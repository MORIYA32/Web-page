require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const connectDB = require('./config/database');
const User = require('./models/User'); 

const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 3001;

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.set('trust proxy', 1);
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change-me',
    name: process.env.SESSION_NAME || 'sid',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: (Number(process.env.SESSION_TTL_HOURS) || 24 * 7) * 60 * 60,
    }),
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge:
        (Number(process.env.SESSION_COOKIE_MAX_AGE_DAYS) || 7) *
        24 *
        60 *
        60 *
        1000,
    },
  })
);

const VIEWS_DIR = path.join(__dirname, 'views');
app.use(express.static(VIEWS_DIR));

function requireAuth(req, res, next) {
  if (!req.session?.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session?.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden (admin only)' });
  }
  next();
}

function safeUseRoute(mountPath, modulePath) {
  try {
    const router = require(modulePath);
    app.use(mountPath, router);
    console.log(`✅ Mounted ${mountPath} from ${modulePath}`);
  } catch (err) {
    console.warn(`⚠️  Skipped ${mountPath} — module ${modulePath} not found or failed to load.`);
  }
}

safeUseRoute('/api/auth', './routes/auth');
safeUseRoute('/api/profiles', './routes/profiles');
safeUseRoute('/api/content', './routes/content');
safeUseRoute('/api/admin', './routes/adminContent');
safeUseRoute('/api', './routes/files');

app.get('/api/auth/whoami', (req, res) => {
  res.json({ user: req.session?.user || null });
});
app.post('/api/auth/logout', (req, res) => {
  req.session?.destroy(() => res.json({ ok: true }));
});
app.get('/healthz', (_req, res) => res.json({ ok: true }));

app.get('/', (_req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'login.html'));
});
app.get('/login', (_req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'login.html'));
});
app.get('/register', (_req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'register.html'));
});
app.get('/profiles', (req, res) => {
  if (req.session?.user?.role === 'admin') {
    return res.redirect('/admin/add-content'); 
  }
  res.sendFile(path.join(VIEWS_DIR, 'profiles.html'));
});
app.get('/feed', (_req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'feed.html'));
});
app.get('/settings', (_req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'settingsPage.html'));
});

app.get('/admin/add-content', requireAuth, requireAdmin, (req, res) => {
  const adminPage = path.join(VIEWS_DIR, 'adminAddContent.html');
  if (fs.existsSync(adminPage)) {
    res.sendFile(adminPage);
  } else {
    res
      .status(200)
      .send(
        '<h3>Admin Add Content</h3><p>צרי קובץ <code>views/adminAddContent.html</code> כדי להציג את המסך.</p>'
      );
  }
});

app.use((err, _req, res, _next) => {
  console.error('Error:', err?.stack || err?.message || err);
  res.status(500).json({ error: 'Internal server error' });
});
app.use('*', (_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});


async function ensureAdmin() {
  const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || 'admin@admin.com').toLowerCase();
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

  let user = await User.findOne({ email: ADMIN_EMAIL });
  if (!user) {
    user = await User.createWithPassword({
      email: ADMIN_EMAIL,
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
      role: 'admin',
    });
    console.log(`👑 Admin created: ${ADMIN_EMAIL} / ${ADMIN_USERNAME}`);
  } else {
    if (user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
      console.log(`🔧 Upgraded existing user to admin: ${ADMIN_EMAIL}`);
    }
    console.log(`✅ Admin ensured: ${ADMIN_EMAIL}`);
  }
}

function startServer(port, attemptsLeft = 0) {
  app
    .listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
      console.log(`🌐 CORS origin: ${CLIENT_ORIGIN}  |  Static dir: ${VIEWS_DIR}`);
    })
    .on('error', (err) => {
      if (err?.code === 'EADDRINUSE' && attemptsLeft > 0) {
        console.warn(`⚠️  Port ${port} in use. Trying ${port + 1}...`);
        startServer(port + 1, attemptsLeft - 1);
      } else {
        console.error('❌ Failed to start server:', err);
        console.error('💡 Windows: netstat -ano | findstr :PORT  →  taskkill /PID <PID> /F');
        process.exit(1);
      }
    });
}

(async function bootstrap() {
  try {
    await connectDB();
    await ensureAdmin();
    startServer(DEFAULT_PORT);
  } catch (err) {
    console.error('❌ Bootstrap failed:', err);
    process.exit(1);
  }
})();
