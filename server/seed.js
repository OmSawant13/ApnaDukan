const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kirana';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB for Seeding'))
    .catch(err => {
        console.error('❌ Connection Error:', err);
        process.exit(1);
    });

const seedData = async () => {
    try {
        // Clear existing data
        await Product.deleteMany({});
        await Category.deleteMany({});
        console.log('🧹 Cleared existing data');

        // 1. Create Categories
        const categories = await Category.insertMany([
            { name: 'Soft Drinks', icon: 'beaker', type: 'unit' },
            { name: 'Spices', icon: 'nutrition', type: 'weight' }, // Toor Dal, etc.
            { name: 'Cleaning', icon: 'sparkles', type: 'unit' },
            { name: 'Baby Care', icon: 'happy', type: 'unit' },
            { name: 'Bakery', icon: 'restaurant', type: 'unit' }, // Brown Bread
            { name: 'Dairy', icon: 'water', type: 'unit' },
            { name: 'Vegetables', icon: 'leaf', type: 'weight' },
        ]);

        const catMap = {};
        categories.forEach(c => catMap[c.name] = c._id);
        console.log('✅ Categories Seeded');

        // 2. Create Products
        const products = [
            // Bakery (Unit)
            {
                name: 'Brown Bread',
                price: 40,
                unit: 'Pack',
                stock: true,
                stockCount: 50,
                categoryId: catMap['Bakery'],
                image: 'brown_bread.png'
            },
            {
                name: 'White Bread',
                price: 35,
                unit: 'Pack',
                stock: true,
                stockCount: 40,
                categoryId: catMap['Bakery'],
                image: 'white_bread.png'
            },

            // Spices / Pulses (Weight)
            {
                name: 'Toor Dal',
                price: 120, // per kg
                unit: 'kg',
                stock: true,
                stockCount: 100, // kg
                categoryId: catMap['Spices'],
                image: 'toor_dal.png'
            },
            {
                name: 'Turmeric Powder',
                price: 250, // per kg
                unit: 'kg',
                stock: true,
                stockCount: 20,
                categoryId: catMap['Spices'],
                image: 'turmeric.png'
            },

            // Soft Drinks
            {
                name: 'Coca Cola',
                price: 90,
                unit: '2L Bottle',
                stock: true,
                stockCount: 100,
                categoryId: catMap['Soft Drinks'],
                image: 'coke.png'
            },
            {
                name: 'Sprite',
                price: 85,
                unit: '2L Bottle',
                stock: true,
                stockCount: 80,
                categoryId: catMap['Soft Drinks'],
                image: 'sprite.png'
            },

            // Cleaning
            {
                name: 'Detergent Powder',
                price: 450,
                unit: '4kg Pack',
                stock: true,
                stockCount: 30,
                categoryId: catMap['Cleaning'],
                image: 'detergent.png'
            },

            // Baby Care
            {
                name: 'Diapers (L)',
                price: 899,
                unit: 'Pack of 50',
                stock: true,
                stockCount: 15,
                categoryId: catMap['Baby Care'],
                image: 'diapers.png'
            }
        ];

        await Product.insertMany(products);
        console.log('✅ Products Seeded');
        console.log('🎉 Database Population Complete!');
        process.exit();

    } catch (error) {
        console.error('❌ Seeding Failed:', error);
        process.exit(1);
    }
};

seedData();
