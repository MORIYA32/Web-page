const User = require('../models/User');

class AuthController {
    constructor() {
        this.userModel = new User();
    }

    async register(req, res) {
        try {
            const { email, username, password } = req.body;

            // Validation
            if (!email || !username || !password) {
                return res.status(400).json({ error: 'Email, username, and password are required' });
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: 'Please enter a valid email' });
            }

            // Username length validation
            if (username.length < 3) {
                return res.status(400).json({ error: 'Username must be at least 3 characters' });
            }

            // Password length validation
            if (password.length < 6) {
                return res.status(400).json({ error: 'Password must be at least 6 characters' });
            }

            // Check if user already exists
            const existingUserByEmail = await this.userModel.findByEmail(email);
            if (existingUserByEmail) {
                return res.status(400).json({ error: 'User already exists with this email' });
            }

            const existingUserByUsername = await this.userModel.findByUsername(username);
            if (existingUserByUsername) {
                return res.status(400).json({ error: 'Username is already taken' });
            }

            // Create new user
            const newUser = await this.userModel.create({ email, username, password });
            
            console.log(`New user registered: ${email} (${username})`);
            
            res.status(201).json({ 
                message: 'User registered successfully',
                user: { id: newUser.id, email: newUser.email, username: newUser.username }
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
            const user = await this.userModel.findByEmail(email);
            if (!user || user.password !== password) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            console.log(`User logged in: ${email}`);

            res.json({ 
                message: 'Login successful',
                user: { id: user.id, email: user.email }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    }
}

module.exports = new AuthController();