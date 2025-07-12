const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        req.flash('error', 'You must be logged in to access this page');
        return res.redirect('/users/login');
    }
    next();
};

// Register form
router.get('/register', (req, res) => {
    res.render('users/register');
});

// Register logic
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;
        
        // Validation
        if (password !== confirmPassword) {
            req.flash('error', 'Passwords do not match');
            return res.redirect('/users/register');
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            req.flash('error', 'Username or email already exists');
            return res.redirect('/users/register');
        }
        
        // Create new user
        const user = new User({ username, email, password });
        await user.save();
        
        req.flash('success', 'Registration successful! Please log in');
        res.redirect('/users/login');
    } catch (error) {
        req.flash('error', 'Registration failed. Please try again');
        res.redirect('/users/register');
    }
});

// Login form
router.get('/login', (req, res) => {
    res.render('users/login');
});

// Login logic
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/users/login');
        }
        
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/users/login');
        }
        
        // Set session
        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            reputation: user.reputation,
            isAdmin: user.isAdmin
        };
        
        req.flash('success', `Welcome back, ${user.username}!`);
        res.redirect('/questions');
    } catch (error) {
        req.flash('error', 'Login failed. Please try again');
        res.redirect('/users/login');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            req.flash('error', 'Logout failed');
            return res.redirect('/questions');
        }
        res.redirect('/questions');
    });
});

// Profile page
router.get('/profile/:id', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password');
        
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/questions');
        }
        
        res.render('users/profile', { user });
    } catch (error) {
        req.flash('error', 'Error loading profile');
        res.redirect('/questions');
    }
});

// Edit profile form
router.get('/profile/:id/edit', requireAuth, async (req, res) => {
    try {
        // Check if user is editing their own profile
        if (req.params.id !== req.session.user.id) {
            req.flash('error', 'You can only edit your own profile');
            return res.redirect('/questions');
        }
        
        const user = await User.findById(req.params.id);
        res.render('users/edit', { user });
    } catch (error) {
        req.flash('error', 'Error loading profile');
        res.redirect('/questions');
    }
});

// Update profile
router.put('/profile/:id', requireAuth, async (req, res) => {
    try {
        const { username, bio } = req.body;
        
        // Check if user is updating their own profile
        if (req.params.id !== req.session.user.id) {
            req.flash('error', 'You can only edit your own profile');
            return res.redirect('/questions');
        }
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { username, bio },
            { new: true, runValidators: true }
        );
        
        // Update session
        req.session.user.username = user.username;
        
        req.flash('success', 'Profile updated successfully');
        res.redirect(`/users/profile/${user._id}`);
    } catch (error) {
        req.flash('error', 'Error updating profile');
        res.redirect(`/users/profile/${req.params.id}/edit`);
    }
});

module.exports = router; 