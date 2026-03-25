const mongoose = require('mongoose');
require('dotenv').config();

// Import Models
const Product = require('./models/Product');
const Category = require('./models/Category');
const Order = require('./models/Order');
const Customer = require('./models/Customer');
const Shop = require('./models/Shop');
const CreditAccount = require('./models/CreditAccount');

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('🚀 Starting Master Database Cleanup...');

        const results = await Promise.all([
            Product.deleteMany({}),
            Category.deleteMany({}),
            Order.deleteMany({}),
            Customer.deleteMany({}),
            Shop.deleteMany({}),
            CreditAccount.deleteMany({})
        ]);

        console.log('--- 📊 Cleanup Results ---');
        console.log(`✅ Products: ${results[0].deletedCount}`);
        console.log(`✅ Categories: ${results[1].deletedCount}`);
        console.log(`✅ Orders: ${results[2].deletedCount}`);
        console.log(`✅ Customers: ${results[3].deletedCount}`);
        console.log(`✅ Shops: ${results[4].deletedCount}`);
        console.log(`✅ Credit Accounts: ${results[5].deletedCount}`);
        
        console.log('\n✨ Database is now completely empty.');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Master Cleanup Error:', err);
        process.exit(1);
    });
