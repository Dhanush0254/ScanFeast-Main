const mongoose = require('mongoose');

const needSchema = new mongoose.Schema({
    item: String, // e.g., "Tomato Sauce"
    status: { type: String, default: 'Pending' }, // Pending, Resolved
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('KitchenNeed', needSchema);