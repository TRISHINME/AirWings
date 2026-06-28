require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken'); // Add the JWT library
const cookieParser = require('cookie-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));
app.use(cors());

// Serve Static HTML Files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/home.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, './public/sign-in.html'));
});

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/signup', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err.message));

// User Schema and Model
const userSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Signup Route
app.post('/signup', async (req, res) => {
    const { firstname, email, password } = req.body;
    try {
        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save the new user
        const newUser = new User({ firstname, email, password: hashedPassword });
        await newUser.save();

        console.log('New user registered:', { firstname, email });
        res.redirect('/');
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, './public/login.html'));  // Serve the login HTML page
});


// Use cookie-parser middleware
app.use(cookieParser());

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user by email (using the username field)
        const user = await User.findOne({ email: username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare the entered password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create a JWT token (you can include more data like the user's ID)
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'your_secret_key', // Use environment variable for secret
            { expiresIn: '1h' } // Token expiration time
        );

        // Set the token in a cookie
        res.cookie('auth_token', token, {
            httpOnly: true,   // Prevents JavaScript from accessing the cookie
            secure: process.env.NODE_ENV === 'production', // Set to true if using HTTPS in production
            maxAge: 3600000, // 1 hour
            sameSite: 'Strict'  // You can change this based on your requirements (e.g., 'Lax', 'Strict', etc.)
        });

        // Send success message
        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
