const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
// Defaulting to local MongoDB if MONGO_URI is not provided in .env
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kirana';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.get('/', (req, res) => {
    res.send('API is Running...');
});

// Import Routes (Placeholder for now)
// const productRoutes = require('./routes/products');
// app.use('/api/products', productRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
