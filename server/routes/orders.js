const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const CreditAccount = require('../models/CreditAccount');
const router = require('express').Router();

// GET ALL ORDERS (Optional filters: ?status=open)
router.get('/', async (req, res) => {
    try {
        const { status, customerId } = req.query;
        const shopId = req.headers['x-shop-id'];

        let query = {};
        if (status) query.status = status;
        if (shopId) query.shopId = shopId;
        if (customerId) query.customerId = customerId;

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
        const { customer, customerId, items, totalAmount, paymentMethod, isCredit, shopId } = req.body;

        const newOrder = new Order({
            customer: customer || 'Guest Customer',
            customerId: customerId || null,
            items,
            totalAmount,
            paymentMethod,
            isCredit,
            shopId,
            status: 'open'
        });

        // const savedOrder = await newOrder.save(); // Moved below stock check

        // Optional: Update Stock Here (If strict consistency needed)
        // But usually frontend handles decrement or separate endpoint.
        // Let's implement stock decrement here for safety?
        // Or keep it simple for now. Let's do it in the "complete" or "create" phase.
        // User asked for "Stock levels are updated once an order is placed".
        // So let's decrement stock here.

        // 1. Strict Stock Check
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ error: `Product ${item.name} not found` });
            }
            if (product.stockCount < item.quantity) {
                return res.status(400).json({
                    error: `Insufficient stock for ${item.name}. Available: ${product.stockCount}, Requested: ${item.quantity}`
                });
            }
        }

        const savedOrder = await newOrder.save();

        // 2. Decrement Stock & Update Status
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (product) {
                product.stockCount -= item.quantity;
                if (product.stockCount <= 0) {
                    product.stockCount = 0;
                    product.stock = false;
                }
                const updatedProduct = await product.save();

                if (req.io) {
                    req.io.emit('product_updated', {
                        action: 'update',
                        product: updatedProduct
                    });
                }
            }
        }

        // 3. AUTO-UPDATE CREDIT LEDGER (If isCredit is true)
        if (isCredit && customerId && shopId) {
            try {
                // Find or create the shop-specific credit account for this customer
                let account = await CreditAccount.findOne({ customerId, shopId });
                if (!account) {
                    account = new CreditAccount({ customerId, shopId });
                }

                const transaction = {
                    type: 'credit',
                    amount: totalAmount,
                    orderId: savedOrder._id,
                    note: `Order #${savedOrder._id.toString().slice(-4)}`
                };

                account.transactions.push(transaction);
                account.balance += totalAmount;
                await account.save();

                // 4. Update Customer Global Balance (Mirror)
                const customer = await Customer.findById(customerId);
                if (customer) {
                    customer.balance += totalAmount;
                    customer.isCreditUser = true;
                    // Also mirror to global history for customer's global profile
                    customer.transactions.push(transaction);
                    await customer.save();
                }

                // Formal confirmation in order document
                savedOrder.isCredit = true;
                await savedOrder.save();
                console.log('✅ CreditAccount & Customer auto-updated for shop:', shopId);
            } catch (err) {
                console.error('❌ Failed to auto-update credit ledger:', err);
            }
        }



        // ⚡ Emit New Order Event
        if (req.io) {
            req.io.emit('new_order', savedOrder);
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

        // ⚡ Emit Socket Update
        if (req.io) {
            req.io.emit('order_updated', updatedOrder);
        }

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
