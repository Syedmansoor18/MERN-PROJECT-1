// server.js

// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

// Initialize the Express app
const app = express();
const PORT = 3000;

// --- Middleware ---
app.use(cors()); 
app.use(express.json()); 
app.use(express.static(path.join(__dirname)));


// --- MongoDB Connection ---
const dbURI = 'mongodb://127.0.0.1:27017/weather-auth-app';

mongoose.connect(dbURI)
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// --- User Database Schema ---
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);


// --- API Routes ---

// Signup Route
app.post('/api/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully! Please log in.' });
    } catch (error) {
        console.error('Signup Server Error:', error);
        res.status(500).json({ message: 'Server error during signup.' });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }
        res.status(200).json({ message: 'Login successful!', user: { email: user.email } });
    } catch (error) {
        console.error('Login Server Error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// Root Route to serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
