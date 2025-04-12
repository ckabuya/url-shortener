const express = require('express');
const router = express.Router();
const Url = require('../models/Url');
const { redisClient } = require('../config/db');

// Function to convert counter to base62 short code
const base62 = (number) => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    while (number > 0) {
        result = characters[number % 62] + result;
        number = Math.floor(number / 62);
    }
    return result || 'a'; // Fallback to 'a' if result is empty
};

// Shorten URL
router.post('/shorten', async (req, res) => {
    const { originalUrl } = req.body;

    // Basic URL validation
    if (!originalUrl || !originalUrl.match(/^(http|https):\/\/[^\s$.?#].[^\s]*$/)) {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    try {
        // Check if URL already exists
        let url = await Url.findOne({ originalUrl });
        if (url) {
            return res.json({ shortUrl: `${process.env.BASE_URL}/${url.shortCode}` });
        }

        // Get the latest counter value
        const lastUrl = await Url.findOne().sort({ counter: -1 });
        const counter = lastUrl ? lastUrl.counter + 1 : 1;

        // Generate short code using base62 encoding
        const shortCode = base62(counter);

        // Save to database
        url = new Url({ originalUrl, shortCode, counter });
        await url.save();

        // Cache the mapping in Redis (TTL: 1 hour)
        await redisClient.setEx(shortCode, 3600, originalUrl);

        res.json({ shortUrl: `${process.env.BASE_URL}/${shortCode}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Redirect URL
router.get('/:shortCode', async (req, res) => {
    const { shortCode } = req.params;

    try {
        // Check Redis cache first
        const cachedUrl = await redisClient.get(shortCode);
        if (cachedUrl) {
            return res.redirect(cachedUrl);
        }

        // If not in cache, check database
        const url = await Url.findOne({ shortCode });
        if (!url) {
            return res.status(404).json({ error: 'URL not found' });
        }

        // Cache the result in Redis (TTL: 1 hour)
        await redisClient.setEx(shortCode, 3600, url.originalUrl);

        res.redirect(url.originalUrl);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;