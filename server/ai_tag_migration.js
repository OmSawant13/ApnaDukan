const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
const Category = require('./models/Category');
const { classifyProduct } = require('./services/aiService');

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for AI Tagging Migration...");

        const products = await Product.find({
            $or: [
                { smartCategory: { $exists: false } },
                { smartCategory: 'other' }
            ]
        });

        console.log(`Found ${products.length} products to classify.`);

        for (const product of products) {
            try {
                const category = await Category.findById(product.categoryId);
                const categoryName = category ? category.name : '';

                console.log(`Classifying: "${product.name}" (Category: ${categoryName})...`);
                const smartTag = await classifyProduct(product.name, categoryName);

                await Product.findByIdAndUpdate(product._id, { smartCategory: smartTag });
                console.log(`Result: ${smartTag}`);
            } catch (err) {
                console.error(`Error classifying ${product.name}:`, err.message);
            }
        }

        console.log("Migration completed!");
        process.exit(0);
    } catch (err) {
        console.error("Migration fatal error:", err);
        process.exit(1);
    }
}

migrate();
