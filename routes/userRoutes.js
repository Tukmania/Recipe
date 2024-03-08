const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import the User model

// Route to handle user registration
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Create a new user instance
        const newUser = new User({ username, email, password });
        // Save the user to the database
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
