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
    image: {
        type: String, // URL of uploaded image
        default: null
    },
    type: {
        type: String,
        enum: ['unit', 'weight'], // Essential for dynamic header logic
        default: 'unit',
    },
    active: {
        type: Boolean,
        default: true
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
