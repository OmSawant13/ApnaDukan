const router = require('express').Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const { classifyProduct } = require('../services/aiService');

// GET all products (Supports ?categoryId=... filter)
router.get('/', async (req, res) => {
    try {
        const { categoryId } = req.query;
        const shopId = req.headers['x-shop-id'];

        let query = {};
        if (categoryId) query.categoryId = categoryId;
        if (shopId) query.shopId = shopId;

        const products = await Product.find(query).sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single product
router.get('/:id', async (req, res) => {
    try {
        const shopId = req.headers['x-shop-id'];
        let query = { _id: req.params.id };
        if (shopId) query.shopId = shopId;

        const product = await Product.findOne(query);
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
        const shopId = req.headers['x-shop-id']; // Extract shopId from header

        // AI Classification
        let smartCategory = 'other';
        try {
            const category = await Category.findById(categoryId);
            const categoryName = category ? category.name : '';
            smartCategory = await classifyProduct(name, categoryName);
        } catch (catErr) {
            console.error("Classification error in route:", catErr);
        }

        const newProduct = new Product({
            name,
            price,
            unit,
            categoryId,
            image, // Can be local path string or URL
            stockCount: stockCount || 0,
            stock: stock !== undefined ? stock : true,
            smartCategory,
            shopId // Save shopId with the new product
        });

        const savedProduct = await newProduct.save();

        // Run AI Classification in background (Non-blocking)
        // This makes the product creation much faster!
        (async () => {
            try {
                const category = await Category.findById(categoryId);
                const categoryName = category ? category.name : '';
                const updatedSmartCategory = await classifyProduct(name, categoryName);
                
                if (updatedSmartCategory !== smartCategory) {
                    savedProduct.smartCategory = updatedSmartCategory;
                    await savedProduct.save();
                    
                    // Emit update again with smart category
                    if (req.io) {
                        req.io.emit('product_updated', { action: 'update', product: savedProduct });
                    }
                }
            } catch (bgErr) {
                console.error("Background Classification error:", bgErr);
            }
        })();

        // Emit Initial Update Event
        if (req.io) {
            req.io.emit('product_updated', { action: 'create', product: savedProduct });
        }

        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT update product (Generic update for stock, price, etc.)
router.put('/:id', async (req, res) => {
    try {
        const { name, categoryId } = req.body;
        const shopId = req.headers['x-shop-id'];

        // If name or category changed, re-classify
        if (name || categoryId) {
            try {
                let findQuery = { _id: req.params.id };
                if (shopId) findQuery.shopId = shopId;
                const existingProduct = await Product.findOne(findQuery);
                if (!existingProduct) return res.status(404).json({ error: 'Product not found' });

                const finalId = categoryId || existingProduct.categoryId;
                const finalName = name || existingProduct.name;

                const category = await Category.findById(finalId);
                const categoryName = category ? category.name : '';

                req.body.smartCategory = await classifyProduct(finalName, categoryName);
            } catch (err) {
                console.error("Re-classification error:", err);
            }
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } // Return updated doc
        );
        if (!updatedProduct) return res.status(404).json({ error: 'Product not found' });

        // Emit Update Event
        if (req.io) {
            req.io.emit('product_updated', { action: 'update', product: updatedProduct });
        }

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

        // Emit Update Event
        if (req.io) {
            req.io.emit('product_updated', { action: 'delete', productId: req.params.id });
        }

        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
