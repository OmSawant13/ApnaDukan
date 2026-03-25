const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const CreditAccount = require('./models/CreditAccount');
const Order = require('./models/Order');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kirana';

async function smartNuke() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB for Zero-Trace Cleanup.');

        // 1. Delete all Customers EXCEPT Shopkeepers
        const customerResult = await Customer.deleteMany({ role: { $ne: 'shopkeeper' } });
        console.log(`🗑️ Deleted ${customerResult.deletedCount} Users (Guests/Customers).`);

        // 2. Wipe ALL Orders
        const orderResult = await Order.deleteMany({});
        console.log(`🗑️ Deleted ${orderResult.deletedCount} Orders.`);

        // 3. Wipe ALL Ledgers (Credit Accounts)
        const creditResult = await CreditAccount.deleteMany({});
        console.log(`🗑️ Deleted ${creditResult.deletedCount} Credit Accounts.`);

        console.log('✨ ZERO-TRACE CLEANUP COMPLETE! Shop/Products/Categories are INTACT.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Nuke Failed:', err);
        process.exit(1);
    }
}

smartNuke();
