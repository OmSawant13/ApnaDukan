const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const Order = require('./models/Order');
const CreditAccount = require('./models/CreditAccount');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kirana';

async function cleanupUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB for cleanup.');

        // 1. Delete all Customers (RESTRICTED TO CUSTOMER ROLE)
        const customerResult = await Customer.deleteMany({ role: 'customer' });
        console.log(`🗑️ Deleted ${customerResult.deletedCount} Customers.`);


        // 2. Delete all Orders (since they refer to old customerIds)
        const orderResult = await Order.deleteMany({});
        console.log(`🗑️ Deleted ${orderResult.deletedCount} Orders.`);

        // 3. Delete all Credit Accounts (ledger entries)
        const creditResult = await CreditAccount.deleteMany({});
        console.log(`🗑️ Deleted ${creditResult.deletedCount} Credit Accounts.`);

        console.log('✨ Cleanup Complete! Shops, Products, and Categories are PRESERVED.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Cleanup Failed:', err);
        process.exit(1);
    }
}

cleanupUsers();
