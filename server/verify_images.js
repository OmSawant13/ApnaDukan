const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kirana';

const categorySchema = new mongoose.Schema({
    name: String,
    image: String,
});

const Category = mongoose.model('Category', categorySchema);

const verify = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const categories = await Category.find({});
        console.log('--- Category Image Report ---');
        categories.forEach(c => {
            console.log(`Category: "${c.name}" | Image: "${c.image || 'MISSING'}"`);
        });
        console.log('-----------------------------');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verify();
