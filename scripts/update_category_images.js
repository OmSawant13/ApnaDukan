const mongoose = require('mongoose');
require('dotenv').config({ path: '../server/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kirana';

const categorySchema = new mongoose.Schema({
    name: String,
    type: String, // 'unit' or 'weight'
    icon: String, // Ionicons name
    image: String, // New field for image asset key
    active: { type: Boolean, default: true }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

const MAPPING = {
    'Fresh Vegetables': 'Vegetables.png',
    'Atta, Chawal & Anaj': 'Atta & Chawal.png',
    'Dal': 'Dal.png',
    'Soft Drinks': 'soft_drinks.png',
    'Spices': 'spices.png',
    'Cleaning': 'cleaning.png',
    'Baby Care': 'baby_care.png',
    'Cheeni & Namak': 'Chini & Namak.png',
    'Dairy': 'Dairy.jpeg',
    'Chai & Nashta': 'Chai & Nashta.png', // Fixed typo: was 'Chain & Nashta'
    'Bakery aur Bread': 'Bakery aur Bread.jpeg',
    // fallback or specific mappings for others if needed
};

const updateImages = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to DB');

        for (const [name, image] of Object.entries(MAPPING)) {
            const res = await Category.updateOne({ name: name }, { $set: { image: image } });
            if (res.matchedCount > 0) {
                console.log(`✅ Updated ${name} -> ${image}`);
            } else {
                console.log(`⚠️ Category not found: ${name}`);
            }
        }

        console.log('🎉 Done updating images');
        process.exit();
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

updateImages();
