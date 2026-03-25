const router = require('express').Router();
const Shop = require('../models/Shop');

// GET all active shops
router.get('/', async (req, res) => {
    try {
        const shops = await Shop.find({ active: true });
        res.json(shops);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET a specific shop
router.get('/:id', async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) return res.status(404).json({ error: 'Shop not found' });
        res.json(shop);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create shop
router.post('/', async (req, res) => {
    try {
        const { name, address, ownerId, image } = req.body;
        if (!name || !address || !ownerId) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }
        const newShop = new Shop({ name, address, ownerId, image });
        const savedShop = await newShop.save();
        res.status(201).json(savedShop);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PATCH update shop
router.patch('/:id', async (req, res) => {
    try {
        const updatedShop = await Shop.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!updatedShop) return res.status(404).json({ error: 'Shop not found' });
        res.json(updatedShop);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
