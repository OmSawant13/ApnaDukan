const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['credit', 'payment'], required: true },
    amount: { type: Number, required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, // Optional link to order
    note: String
});

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    profilePic: {
        type: String, // URL or Base64
        default: null
    },
    balance: {
        type: Number,
        default: 0 // Positive means customer owes shopkeeper
    },
    transactions: [transactionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
