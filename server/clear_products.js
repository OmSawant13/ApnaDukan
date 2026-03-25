const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('🗑️  Clearing all Products specific data...');

        // Delete all products
        const result = await Product.deleteMany({});

        console.log(`✅ Deleted ${result.deletedCount} products.`);
        console.log('✨ Database is now clean (Categories preserved).');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
