require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors());

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/booking.html');
});

// Connect to MongoDB (local or Atlas)
mongoose.connect('mongodb://127.0.0.1:27017/bookingdetails').then(() => {
    console.log("Connected to MongoDB");
}).catch(err => {
    console.error("MongoDB connection error:", err.message);
});

// Booking Schema
const bookingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    entryPoint: { type: String, required: true },
    destination: { type: String, required: true },
    seats: { type: Number, required: true },
    totalAmount: { type: Number, required: true }
});

const Booking = mongoose.model('Booking', bookingSchema);

// Booking Route
app.post('/book', async (req, res) => {
    const { name, email, entryPoint, destination, seats, totalAmount } = req.body;

    try {
        const newBooking = new Booking({ name, email, entryPoint, destination, seats, totalAmount });
        await newBooking.save();

        res.status(201).json({ message: 'Booking successful' });
    } catch (error) {
        console.error('Error during booking:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Start Server
const PORT = process.env.PORT || 5501; // Ensure the port number is correct
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
