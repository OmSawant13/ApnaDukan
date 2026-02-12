const router = require('express').Router();
const Product = require('../models/Product');

// GET all products (Supports ?categoryId=... filter)
router.get('/', async (req, res) => {
    try {
        const { categoryId } = req.query;
        let query = {};
        if (categoryId) query.categoryId = categoryId;

        const products = await Product.find(query).sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create product
router.post('/', async (req, res) => {
    try {
        const { name, price, unit, categoryId, image, stockCount, stock } = req.body;

        const newProduct = new Product({
            name,
            price,
            unit,
            categoryId,
            image, // Can be local path string or URL
            stockCount: stockCount || 0,
            stock: stock !== undefined ? stock : true,
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT update product (Generic update for stock, price, etc.)
router.put('/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true } // Return updated doc
        );
        if (!updatedProduct) return res.status(404).json({ error: 'Product not found' });
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE product
router.delete('/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
