const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['credit', 'payment'], required: true },
    amount: { type: Number, required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    note: String
});

const creditAccountSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    balance: {
        type: Number,
        default: 0
    },
    transactions: [transactionSchema]
}, { timestamps: true });

// Ensure unique account per customer-shop pair
creditAccountSchema.index({ customerId: 1, shopId: 1 }, { unique: true });

module.exports = mongoose.model('CreditAccount', creditAccountSchema);
