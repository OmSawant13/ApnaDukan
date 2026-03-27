const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity in development
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Pass io to routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Database Connection
// Defaulting to local MongoDB if MONGO_URI is not provided in .env
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kirana';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.get('/', (req, res) => {
    res.send('API is Running v1.1 (Auth Fix)...');
});

// Import Routes
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const customerRoutes = require('./routes/customers');
const shopRoutes = require('./routes/shops');

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/credits', require('./routes/credits'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/translate', require('./routes/translation'));

// Serve Static Uploads
app.use('/uploads', express.static('uploads'));

// Socket Connection Logic
io.on('connection', (socket) => {
    console.log('⚡ Client Connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('❌ Client Disconnected:', socket.id);
    });
});

// Start Server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
