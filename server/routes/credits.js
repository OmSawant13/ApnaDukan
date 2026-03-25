const router = require('express').Router();
const CreditAccount = require('../models/CreditAccount');
const Order = require('../models/Order');
const Shop = require('../models/Shop');

// GET Global Summary for a Customer
router.get('/summary/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;

        // 1. Get all shop-specific credit accounts
        const accounts = await CreditAccount.find({ customerId }).populate('shopId', 'name image');

        // 2. Get all orders to calculate stats
        const orders = await Order.find({ customerId });

        // calculate total spending
        const totalSpending = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        // Calculate shop usage (which shop has most orders)
        const shopStats = {};
        orders.forEach(order => {
            if (order.shopId) {
                const sid = order.shopId.toString();
                shopStats[sid] = (shopStats[sid] || 0) + 1;
            }
        });


        // Find most visited shop
        let mostVisitedShopId = null;
        let maxVisits = 0;
        for (const [sid, visits] of Object.entries(shopStats)) {
            if (visits > maxVisits) {
                maxVisits = visits;
                mostVisitedShopId = sid;
            }
        }

        const mostVisitedShop = mostVisitedShopId ? await Shop.findById(mostVisitedShopId).select('name') : null;

        // Calculate AVG Order Value
        const avgOrderValue = orders.length > 0 ? Math.round(totalSpending / orders.length) : 0;

        // Calculate total balance
        const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

        // Get last 5 transactions across all accounts
        const recentTransactions = accounts
            .flatMap(acc => acc.transactions.map(t => ({ ...t.toObject(), shopName: acc.shopId?.name, shopId: acc.shopId?._id })))
            .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
            .slice(0, 5);

        res.json({
            totalBalance,
            totalSpending,
            avgOrderValue,
            totalOrders: orders.length,
            mostVisitedShop: mostVisitedShop ? mostVisitedShop.name : 'N/A',
            recentTransactions,
            accounts: accounts
                .filter(acc => acc.shopId) // Safety check: shop might be deleted
                .map(acc => ({
                    shopId: acc.shopId._id,
                    shopName: acc.shopId.name,
                    shopImage: acc.shopId.image,
                    balance: acc.balance,
                    lastUpdated: acc.updatedAt
                }))
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST Add Transaction to a Shop Account
router.post('/transaction', async (req, res) => {
    try {
        const { customerId, shopId, type, amount, note } = req.body;

        // Find or create account
        let account = await CreditAccount.findOne({ customerId, shopId });
        if (!account) {
            account = new CreditAccount({ customerId, shopId });
        }

        const transaction = {
            type,
            amount: Number(amount),
            note: note || (type === 'credit' ? 'Purchase Credit' : 'Payment')
        };

        account.transactions.push(transaction);

        if (type === 'credit') {
            account.balance += Number(amount);
        } else if (type === 'payment') {
            account.balance -= Number(amount);
        }

        await account.save();
        res.json(account);

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
