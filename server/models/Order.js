const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: {
        type: String,
        required: true,
        default: 'Guest Customer'
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: false // Optional for now to support guest checkout if needed
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: { type: String, required: true }, // Keep snapshot of name
        price: { type: Number, required: true }, // Keep snapshot of price
        unit: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String } // 'Panipuri.jpeg' etc
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'completed'],
        default: 'open'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'credit', 'online'],
        default: 'cash'
    },
    isCredit: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
