const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

const DEFAULT_CATEGORIES = [
    { name: 'Soft Drinks', type: 'unit', icon: 'beer' }, // Ionicon names
    { name: 'Spices', type: 'unit', icon: 'flask' },
    { name: 'Cleaning', type: 'unit', icon: 'water' },
    { name: 'Baby Care', type: 'unit', icon: 'happy' }
];

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('🔄 Restoring Default Categories...');

        for (const cat of DEFAULT_CATEGORIES) {
            const exists = await Category.findOne({ name: cat.name });
            if (!exists) {
                await Category.create(cat);
                console.log(`✅ Created: ${cat.name}`);
            } else {
                console.log(`ℹ️  Skipped (Already Exists): ${cat.name}`);
            }
        }

        console.log('✨ Default Categories Restored.');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
