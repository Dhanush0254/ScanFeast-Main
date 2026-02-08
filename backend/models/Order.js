const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    tableNo: { type: Number, required: true },
    items: Array,
    totalAmount: Number,
    
    status: { 
        type: String, 
        enum: ['Placed', 'Accepted', 'Cooking', 'Ready', 'Served', 'Completed'],
        default: 'Placed'
    },
    
    // 🔥 KITCHEN TIMER LOGIC
    estimatedTime: { type: Number, default: 0 }, // In minutes
    startTime: { type: Date }, // When Chef clicked "Accept"
    delayAdded: { type: Number, default: 0 }, // Extra time added
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);