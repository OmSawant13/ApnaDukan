const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

const TARGETS = ['dudh', 'dahi', 'panner', 'paneer', 'milk', 'curd']; // Variations

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('🧹 Cleaning up specific items...');

        // 1. Delete Products
        const prodRes = await Product.deleteMany({
            name: { $in: TARGETS.map(t => new RegExp(t, 'i')) }
        });
        console.log(`✅ Deleted ${prodRes.deletedCount} products matching targets.`);

        // 2. Delete Categories
        const catRes = await Category.deleteMany({
            name: { $in: TARGETS.map(t => new RegExp(t, 'i')) }
        });
        console.log(`✅ Deleted ${catRes.deletedCount} categories matching targets.`);

        console.log('✨ Cleanup Complete.');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
