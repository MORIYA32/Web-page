const User = require('../models/User');

class AuthController {
    async register(req, res) {
        try {
            const { email, username, password } = req.body;

            // Validation
            if (!email || !username || !password) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: 'Invalid email format' });
            }

            // Username length validation
            if (username.trim().length < 3) {
                return res.status(400).json({ error: 'Username must be at least 3 characters' });
            }

            // Password length validation
            if (password.length < 6) {
                return res.status(400).json({ error: 'Password must be at least 6 characters' });
            }

            // Check if user already exists
            const existingUser = await User.findOne({ 
                $or: [{ email: email.toLowerCase() }, { username }] 
            });

            if (existingUser) {
                if (existingUser.email === email.toLowerCase()) {
                    return res.status(400).json({ error: 'Email already registered' });
                }
                if (existingUser.username === username) {
                    return res.status(400).json({ error: 'Username already taken' });
                }
            }

            // Create new user
            const newUser = await User.create({
                email: email.toLowerCase(),
                username: username.trim(),
                password // In production, hash this!
            });

            console.log(`New user registered: ${newUser.username} (${newUser.email})`);

            res.status(201).json({
                message: 'Registration successful',
                user: {
                    id: newUser._id,
                    email: newUser.email,
                    username: newUser.username
                }
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Registration failed' });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validation
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            // Find user
            const user = await User.findOne({ email: email.toLowerCase() });

            if (!user || user.password !== password) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            console.log(`User logged in: ${user.username}`);

            res.json({
                message: 'Login successful',
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    }
}

module.exports = new AuthController();