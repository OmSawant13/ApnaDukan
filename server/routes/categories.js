const router = require('express').Router();
const Category = require('../models/Category');
const Product = require('../models/Product');

// GET all categories
router.get('/', async (req, res) => {
    try {
        const shopId = req.headers['x-shop-id'];
        let query = { active: true };
        if (shopId) query.shopId = shopId;

        const categories = await Category.find(query);
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create category
router.post('/', async (req, res) => {
    try {
        const { name, type, icon, image, shopId } = req.body;
        const newCategory = new Category({ name, type, icon, image, shopId });
        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE category
router.delete('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ error: 'Category not found' });

        // Optional: Delete all associated products?
        // await Product.deleteMany({ categoryId: req.params.id });

        await category.deleteOne();
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
