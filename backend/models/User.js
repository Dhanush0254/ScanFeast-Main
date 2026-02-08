const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['ADMIN', 'KITCHEN', 'USER'], 
        default: 'USER' 
    },
    lastLogin: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);