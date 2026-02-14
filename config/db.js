const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/CSC380?authSource=admin';


// ============================================
// MONGOOSE ScHEMAS AND MODELS
// ============================================


const User = mongoose.model('User', userSchema, 'users');
const Exchange = mongoose.model('Exchange', exchangeSchema, 'exchanges');

// ============================================
// DATABASE CONNECTION
// ============================================

const connectDB = async () => {
    await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('Connected to MongoDB - CSC380 database');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
}

module.exports = connectDB;