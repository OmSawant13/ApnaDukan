const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    unit: {
        type: String, // kg, litre, packet, dozen etc.
        required: true,
    },
    active: {
        type: Boolean,
        default: true
    },
    stock: {
        type: Boolean,
        default: true
    },
    stockCount: {
        type: Number,
        default: 0
    },
    image: {
        type: String, // URL or local path
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isCredit: {
        type: Boolean,
        default: false
    },
    smartCategory: {
        type: String,
        enum: ['daily', 'snacks', 'cooking', 'household', 'baby', 'other'],
        default: 'other'
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
