const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true }, // e.g., 'Tiffins', 'Meals'
    price: { type: Number, required: true },
    image: { type: String },
    description: String,
    isAvailable: { type: Boolean, default: true },
    
    // 🔥 SMART FEATURES
    timeOfDay: [{ type: String }], // ['Morning', 'Afternoon', 'Evening', 'Night']
    isSpecial: { type: Boolean, default: false }, // Today's Special
    stock: { type: Number, default: 50 }, // For Low Stock Alerts
    salesCount: { type: Number, default: 0 } // For "Most Selling"
});

module.exports = mongoose.model('Menu', menuSchema);