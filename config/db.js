// config/db.js
const mongoose = require('mongoose');
const Redis = require('redis');
require('dotenv').config();

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI); // Remove deprecated options
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Redis Connection (we'll address this in the next section)
const redisClient = Redis.createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
});

redisClient.on('error', (err) => {
    console.error('Redis connection error:', err.message);
    if (err.code === 'ECONNREFUSED') {
        console.error('Could not connect to Redis. Ensure Redis is running on the specified host/port.');
    }
});

redisClient.on('connect', () => console.log('Redis connected'));

const connectRedis = async () => {
    try {
        await redisClient.connect();
    } catch (error) {
        console.error('Failed to connect to Redis:', error.message);
    }
};

module.exports = { connectDB, redisClient, connectRedis };