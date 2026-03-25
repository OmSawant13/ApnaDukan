const mongoose = require('mongoose');
const Customer = require('./models/Customer');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kirana';

async function restoreShopkeeper() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB for Restoration.');

        const shopkeeper = {
            _id: "69c3958c565969d93c423876",
            name: "Om Sawant",
            mobile: "9999999999", // Default/Placeholder Mobile
            role: "shopkeeper",
            balance: 0,
            transactions: []
        };

        await Customer.findOneAndUpdate(
            { _id: shopkeeper._id },
            { $set: shopkeeper },
            { upsert: true, new: true }
        );

        console.log('✨ Shopkeeper RESTORED successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Restoration Failed:', err);
        process.exit(1);
    }
}

restoreShopkeeper();
