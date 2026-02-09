const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    weight: {
        type: String, // e.g., "1 kg", "500 gm"
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    mrp: {
        type: Number,
    },
    type: {
        type: String,
        enum: ['unit', 'weight'],
        default: 'unit'
    },
    image: {
        type: String, // URL or asset path
    },
    category: {
        type: String,
        default: 'General'
    },
    inStock: {
        type: Boolean,
        default: true
    },
    description: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
