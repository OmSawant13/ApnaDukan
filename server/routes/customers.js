const router = require('express').Router();
const Customer = require('../models/Customer');
const Order = require('../models/Order');

// GET all customers (Sorted by balance desc)
router.get('/', async (req, res) => {
    try {
        const customers = await Customer.find().sort({ balance: -1 });
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST Login via Phone & Password
router.post('/login', async (req, res) => {
    try {
        const { phone, password } = req.body;
        const customer = await Customer.findOne({ phone });
        if (!customer) return res.status(404).json({ error: 'User not found' });

        // Simple Password Check (Plaintext for now)
        if (customer.password !== password) {
            return res.status(401).json({ error: 'Invalid Password' });
        }

        res.json(customer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create customer (Signup)
router.post('/', async (req, res) => {
    try {
        const { name, phone, password, profilePic } = req.body;
        // Basic Validation
        if (!name || !phone || !password) {
            return res.status(400).json({ error: 'Please fill all fields' });
        }

        const newCustomer = new Customer({ name, phone, password, profilePic });
        const savedCustomer = await newCustomer.save();
        res.status(201).json(savedCustomer);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST add transaction (Generic for Manual Entry)
router.post('/:id/transaction', async (req, res) => {
    try {
        const { type, amount, note } = req.body;
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        const transaction = {
            type,
            amount: Number(amount),
            note
        };

        customer.transactions.push(transaction);

        // Update Balance
        if (type === 'credit') {
            customer.balance += Number(amount);
        } else if (type === 'payment') {
            customer.balance -= Number(amount);
        }

        await customer.save();
        res.json(customer);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST create transaction from Order (Link Order ID)
router.post('/from-order', async (req, res) => {
    try {
        const { customerId, orderId, amount } = req.body;

        const customer = await Customer.findById(customerId);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        // Add Transaction
        const transaction = {
            type: 'credit',
            amount: Number(amount),
            orderId,
            note: 'Order #' + orderId.slice(-4)
        };

        customer.transactions.push(transaction);
        customer.balance += Number(amount);
        await customer.save();

        // Update Order to mark as credit? (Optional, tracked in Order schema via isCredit flag if needed)
        // For now, just linking here is enough.

        res.json(customer);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
