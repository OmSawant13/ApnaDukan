const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function migrate() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const Category = mongoose.model('Category', new mongoose.Schema({ name: String }));

        const result = await Category.updateOne(
            { name: 'Chain & Nashta' },
            { $set: { name: 'Chai & Nashta' } }
        );

        if (result.matchedCount > 0) {
            console.log('✅ Success: Renamed "Chain & Nashta" to "Chai & Nashta"');
        } else {
            console.log('ℹ️ No category found with name "Chain & Nashta" (might be already fixed)');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Migration Error:', err);
        process.exit(1);
    }
}

migrate();
