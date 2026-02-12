const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// GET ALL ORDERS (Optional filters: ?status=open)
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status) query.status = status;

        const orders = await Order.find(query).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET SINGLE ORDER
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE NEW ORDER
router.post('/', async (req, res) => {
    try {
        const { customer, items, totalAmount, paymentMethod, isCredit } = req.body;

        const newOrder = new Order({
            customer: customer || 'Guest Customer',
            items,
            totalAmount,
            paymentMethod,
            isCredit,
            status: 'open'
        });

        const savedOrder = await newOrder.save();

        // Optional: Update Stock Here (If strict consistency needed)
        // But usually frontend handles decrement or separate endpoint.
        // Let's implement stock decrement here for safety?
        // Or keep it simple for now. Let's do it in the "complete" or "create" phase.
        // User asked for "Stock levels are updated once an order is placed".
        // So let's decrement stock here.

        for (const item of items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stockCount: -item.quantity },
                // Check if stock becomes 0, set stock: false?
                // Let's keep it simple: just decrement. Frontend can re-fetch.
            });
        }

        res.status(201).json(savedOrder);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// UPDATE ORDER STATUS (Mark Complete/Packed)
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body; // 'completed'
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!updatedOrder) return res.status(404).json({ error: 'Order not found' });
        res.json(updatedOrder);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE ORDER
router.delete('/:id', async (req, res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
        if (!deletedOrder) return res.status(404).json({ error: 'Order not found' });
        res.json({ message: 'Order deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
