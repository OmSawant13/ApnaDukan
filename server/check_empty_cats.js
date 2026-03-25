const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kirana';

const productSchema = new mongoose.Schema({
    categoryId: mongoose.Schema.Types.ObjectId
});
const categorySchema = new mongoose.Schema({
    name: String
});

const Product = mongoose.model('Product', productSchema);
const Category = mongoose.model('Category', categorySchema);

const check = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const categories = await Category.find({ name: { $in: ['Daily Care', 'Rozmarra'] } });

        for (const cat of categories) {
            const count = await Product.countDocuments({ categoryId: cat._id });
            console.log(`Category: "${cat.name}" | Products: ${count}`);
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
