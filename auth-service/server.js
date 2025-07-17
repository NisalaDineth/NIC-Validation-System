require('dotenv').config();

const express = require('express');

const app = express();
const authRoutes = require('./routes/auth');

const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:5173', // Adjust this to your frontend URL
}));

// Middleware to parse JSON requests
app.use(express.json());
app.use('/api/auth', authRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Auth service Server is running on port ${PORT}`);
});