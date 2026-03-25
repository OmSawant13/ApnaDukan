const mongoose = require('mongoose');
const Category = require('./models/Category');
const CreditAccount = require('./models/CreditAccount');
const Customer = require('./models/Customer');
const Order = require('./models/Order');
const Product = require('./models/Product');
const Shop = require('./models/Shop');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kirana';

async function hardReset() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('🏁 Connected to MongoDB for HARD RESET.');

        const collections = [
            { name: 'Shops', model: Shop },
            { name: 'Customers & Shopkeepers', model: Customer },
            { name: 'Orders', model: Order },
            { name: 'Products', model: Product },
            { name: 'Categories', model: Category },
            { name: 'Credit Accounts (Ledgers)', model: CreditAccount }
        ];

        for (const coll of collections) {
            const result = await coll.model.deleteMany({});
            console.log(`🗑️ Wiped EVERYTHING from ${coll.name} (${result.deletedCount} items).`);
        }

        console.log('✨ SYSTEM HARD RESET COMPLETE! Database is a BLANK SLATE.');
        console.log('🚀 You can now create fresh Shops, Categories, and Users.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Hard Reset Failed:', err);
        process.exit(1);
    }
}

hardReset();
