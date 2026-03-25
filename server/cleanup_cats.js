const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kirana';

const categorySchema = new mongoose.Schema({
    name: String
});

const Category = mongoose.model('Category', categorySchema);

const cleanup = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const res = await Category.deleteMany({ name: { $in: ['Daily Care', 'Rozmarra'] } });
        console.log(`Deleted ${res.deletedCount} empty categories.`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

cleanup();
