const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    originalUrl: { type: String, required: true },
    shortCode: { type: String, required: true, unique: true },
    counter: { type: Number, required: true }, // For counter-based short code
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Url', urlSchema);