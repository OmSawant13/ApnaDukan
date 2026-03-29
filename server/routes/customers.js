const router = require('express').Router();
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Shop = require('../models/Shop');
const Product = require('../models/Product');

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

        // 5. Emit Socket Event for Real-Time Sync
        if (req.io) {
            req.io.emit('credit_update', {
                customerId,
                shopId: order.shopId,
                amount: Number(amount)
            });
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

// POST Signup
router.post('/', async (req, res) => {
    try {
        const { name, phone, password, role, profilePic } = req.body;

        // Basic Check
        if (!name || !phone || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if user exists
        const existing = await Customer.findOne({ phone });
        if (existing) {
            return res.status(400).json({ error: 'Phone number already registered' });
        }

        const customer = new Customer({ name, phone, password, role, profilePic });
        await customer.save();

        res.status(201).json(customer);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST Login
router.post('/login', async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ error: 'Phone and password required' });
        }

        const user = await Customer.findOne({ phone, password });
        if (!user) {
            return res.status(401).json({ error: 'Invalid phone or password' });
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE Account (Cascading Delete)
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await Customer.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log(`🗑️ [DELETE] Processing account deletion for: ${user.name} (${user.role})`);

        if (user.role === 'shopkeeper') {
            // 1. Find the shop owned by this user
            const shop = await Shop.findOne({ ownerId: userId });
            
            if (shop) {
                console.log(`   - Deleting Shop: ${shop.name}`);
                
                // 2. Delete all products belonging to this shop
                const productDeleteResult = await Product.deleteMany({ shopId: shop._id });
                console.log(`   - Deleted ${productDeleteResult.deletedCount} products`);

                // 3. Delete the shop itself
                await Shop.findByIdAndDelete(shop._id);
            }
        }

        // 4. Delete associated CreditAccount if any (as a customer)
        const CreditAccount = require('../models/CreditAccount');
        await CreditAccount.deleteMany({ customerId: userId });

        // 5. Finally, delete the customer
        await Customer.findByIdAndDelete(userId);

        console.log(`✅ [DELETE] Account and associated data removed successfully.`);
        res.json({ message: 'Account and associated data deleted successfully' });

    } catch (err) {
        console.error('❌ Delete Account Error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
