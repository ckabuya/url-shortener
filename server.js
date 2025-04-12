const express = require('express');
const { connectDB, connectRedis } = require('./config/db');
const urlRoutes = require('./routes/url');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/', urlRoutes);

// Start server
const PORT = process.env.PORT || 3000;
const startServer = async () => {
    await connectDB(); // Connect to MongoDB
    await connectRedis(); // Connect to Redis
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();