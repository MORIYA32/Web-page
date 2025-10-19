const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Profile = require('../models/Profile');

const SALT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 10);
const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || 'admin@admin.com').toLowerCase();

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function postLoginRedirect(role) {
  return role === 'admin'
    ? '/admin/add-content'
    : (process.env.POST_LOGIN_PATH_USER || '/profiles');
}

async function hashPassword(plain) {
  return bcrypt.hash(String(plain), SALT_ROUNDS);
}

async function verifyAgainstModel(user, plain) {
  if (user && typeof user.verifyPassword === 'function') {
    return user.verifyPassword(plain);
  }
  if (user?.passwordHash) {
    return bcrypt.compare(String(plain), user.passwordHash);
  }
  if (typeof user?.password === 'string') {
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) {
      try {
        return await bcrypt.compare(String(plain), user.password);
      } catch {
      }
    }
    return String(plain) === user.password;
  }
  return false;
}

class AuthController {
  async register(req, res) {
    try {
      const { email, username, password } = req.body || {};
      const cleanEmail = String(email || '').trim().toLowerCase();
      const cleanUsername = String(username || '').trim();

      if (!cleanEmail || !cleanUsername || !password) {
        return res.status(400).json({ error: 'email, username, password are required' });
      }
      if (!isValidEmail(cleanEmail)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      if (cleanUsername.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters' });
      }
      if (String(password).length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const existing = await User.findOne({ $or: [{ email: cleanEmail }, { username: cleanUsername }] });
      if (existing) {
        if (existing.email === cleanEmail) return res.status(400).json({ error: 'Email already registered' });
        if (existing.username === cleanUsername) return res.status(400).json({ error: 'Username already taken' });
      }

      const role = cleanEmail === ADMIN_EMAIL ? 'admin' : 'user';

      let user;
      if (typeof User.createWithPassword === 'function') {
        user = await User.createWithPassword({ email: cleanEmail, username: cleanUsername, password, role });
      } else {
        user = new User({ email: cleanEmail, username: cleanUsername, role });
        if (User.schema.path('passwordHash')) {
          user.passwordHash = await hashPassword(password);
          user.password = undefined;
        } else {
          user.password = await hashPassword(password);
        }
        await user.save();
      }

      try { await Profile.create({ userId: user._id, name: cleanUsername }); } catch (e) { /* no-op */ }

      const sessionRole = user.role || (cleanEmail === ADMIN_EMAIL ? 'admin' : 'user');
      req.session.user = { id: user._id.toString(), email: user.email, username: user.username, role: sessionRole };

      return res.status(201).json({ ok: true, user: req.session.user, redirect: postLoginRedirect(sessionRole) });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ error: 'Registration failed' });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body || {};
      const cleanEmail = String(email || '').trim().toLowerCase();

      if (!cleanEmail || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await User.findOne({ email: cleanEmail });
      if (!user) return res.status(401).json({ error: 'Invalid email or password' });

      const ok = await verifyAgainstModel(user, password);
      if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

      const role = user.role || (cleanEmail === ADMIN_EMAIL ? 'admin' : 'user');
      req.session.user = { id: user._id.toString(), email: user.email, username: user.username, role };

      return res.json({ ok: true, user: req.session.user, redirect: postLoginRedirect(role) });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Login failed' });
    }
  }

  async logout(req, res) {
    try {
      if (req.session) {
        req.session.destroy(() => res.json({ ok: true }));
      } else {
        res.json({ ok: true });
      }
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }

  async whoami(req, res) {
    return res.json({ user: req.session?.user || null });
  }


  async deleteUser(req, res) {
    try {
      const sessionUser = req.session?.user;
      if (!sessionUser) return res.status(401).json({ error: 'Unauthorized' });

      const targetId = (sessionUser.role === 'admin' && req.query?.id) ? req.query.id : sessionUser.id;

      const toDelete = await User.findById(targetId);
      if (!toDelete) return res.status(404).json({ error: 'User not found' });

      await Profile.deleteMany({ userId: toDelete._id });
      await User.deleteOne({ _id: toDelete._id });

      if (targetId === sessionUser.id) {
        req.session?.destroy(() => res.json({ ok: true, deleted: targetId }));
      } else {
        res.json({ ok: true, deleted: targetId });
      }
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Delete failed' });
    }
  }
}

module.exports = new AuthController();
