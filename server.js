const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const router = require("./routes/router.js");
const app = express();
const cors = require('cors');
const cookieParser = require("cookie-parser");

// Middleware
app.use(express.json());
app.use(cookieParser());

const corsOptions = {
    origin: 'http://localhost:8000', // Frontend URL
    credentials: true // Allow cookies
};

app.use(cors());
app.use(router);

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

// Call the database connection function
connectDB();

// Define a basic route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Start the server
const PORT = process.env.PORT || 8000;  // Default to 8000 if not set
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
