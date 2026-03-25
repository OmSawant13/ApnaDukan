const router = require('express').Router();
const Customer = require('../models/Customer');
const Order = require('../models/Order');

// GET ALL customers for THIS shop
router.get('/', async (req, res) => {
    try {
        const shopId = req.headers['x-shop-id'];
        if (!shopId) return res.status(400).json({ error: 'Shop ID required' });

        const CreditAccount = require('../models/CreditAccount');
        
        // 1. Get ALL users with role 'customer'
        const allCustomers = await Customer.find({ role: 'customer' });

        // 2. Get all existing accounts for this shop to map balances
        const shopAccounts = await CreditAccount.find({ shopId });
        const balanceMap = {};
        shopAccounts.forEach(acc => {
            if (acc.customerId) balanceMap[acc.customerId.toString()] = acc.balance;
        });

        // 3. Match and Return
        const customers = allCustomers.map(c => ({
            ...c.toObject(),
            balance: balanceMap[c._id.toString()] || 0
        })).sort((a, b) => b.balance - a.balance);

        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [PRIORITY] POST create transaction from Order (Link Order ID)
router.post('/from-order', async (req, res) => {
    try {
        let { customerId, customerName, orderId, amount } = req.body;
        console.log(`📝 [DEBUG] from-order hit: ID=${customerId}, Name=${customerName}, Order=${orderId}`);

        // 1. ATOMIC LOCK on Order: Ensure it's not already credited
        const order = await Order.findOneAndUpdate(
            { _id: orderId, isCredit: false },
            { isCredit: true, paymentMethod: 'credit' },
            { new: true }
        );

        if (!order) {
            const existingOrder = await Order.findById(orderId);
            if (!existingOrder) return res.status(404).json({ error: 'Order not found' });
            return res.status(400).json({ error: 'Order already credited or processed.' });
        }

        // 2. Identify/Create Customer (Smart Match + Auto Onboard)
        let customer;
        if (customerId) {
            customer = await Customer.findById(customerId);
            if (!customer) {
                console.log(`⚠️ [DEBUG] Legacy ID ${customerId} not found. Using Name Fallback.`);
                customerId = null; 
            }
        }

        if (!customerId && customerName) {
            customer = await Customer.findOne({ 
                name: new RegExp(`^${customerName.trim()}$`, 'i'), 
                role: 'customer' 
            });

            if (!customer) {
                console.log(`✨ [DEBUG] Auto-Onboarding NEW Customer: ${customerName}`);
                customer = new Customer({
                    name: customerName.trim(),
                    phone: 'guest_' + Math.random().toString(36).slice(-6),
                    password: '123',
                    role: 'customer',
                    isCreditUser: true
                });
                await customer.save();
            }
            customerId = customer._id;
        }

        if (!customerId) return res.status(400).json({ error: 'Customer not found (ID or Name missing)' });

        // 3. Add to CreditAccount (Source of Truth)
        const CreditAccount = require('../models/CreditAccount');
        let account = await CreditAccount.findOne({ customerId, shopId: order.shopId });
        if (!account) account = new CreditAccount({ customerId, shopId: order.shopId });

        const transaction = {
            type: 'credit',
            amount: Number(amount),
            orderId,
            note: 'Order #' + orderId.slice(-4)
        };

        account.transactions.push(transaction);
        account.balance += Number(amount);
        await account.save();

        // 4. Update Global Customer Mirror
        if (customer) {
            customer.balance = (customer.balance || 0) + Number(amount);
            customer.isCreditUser = true;
            customer.transactions.push(transaction);
            await customer.save();
        }

        res.json(customer || account);
    } catch (err) {
        console.error('❌ from-order Error:', err);
        res.status(400).json({ error: err.message });
    }
});

// GET single customer by ID
router.get('/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ error: 'User not found' });
        res.json(customer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



module.exports = router;
