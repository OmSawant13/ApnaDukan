const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kirana';

console.log('Connecting to:', MONGO_URI);

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB Connected Successfully');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);
    });
