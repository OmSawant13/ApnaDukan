const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('🗑️  Clearing all Categories...');

        // Delete all categories
        const result = await Category.deleteMany({});

        console.log(`✅ Deleted ${result.deletedCount} categories.`);
        console.log('✨ Database is now completely empty (Products were already cleared).');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
