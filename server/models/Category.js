const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    icon: {
        type: String, // Ionicon name
        default: 'grid',
    },
    type: {
        type: String,
        enum: ['unit', 'weight'], // Essential for dynamic header logic
        default: 'unit',
    },
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
