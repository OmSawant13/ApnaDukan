const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kirana';

async function resetDatabase() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected.');

        const collections = ['customers', 'products', 'categories', 'orders', 'shops', 'credits'];

        for (const colName of collections) {
            try {
                const collection = mongoose.connection.collection(colName);
                const count = await collection.countDocuments();
                if (count > 0) {
                    await collection.deleteMany({});
                    console.log(`🧹 Cleared ${count} items from [${colName}]`);
                } else {
                    console.log(`ℹ️ [${colName}] is already empty.`);
                }
            } catch (err) {
                console.log(`⚠️ Skipping [${colName}] (might not exist yet).`);
            }
        }

        console.log('\n✨ DATABASE RESET COMPLETE! App is now Fresh. ✨');
        process.exit(0);
    } catch (err) {
        console.error('❌ Reset failed:', err);
        process.exit(1);
    }
}

resetDatabase();
