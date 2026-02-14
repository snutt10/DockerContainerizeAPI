const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/CSC380?authSource=admin';


// ============================================
// MONGOOSE ScHEMAS AND MODELS
// ============================================
/*
const gameSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    publisher: {
        type: String,
        required: true
    },
    yearPublished: {
        type: Number,
        required: true
    },
    gamingSystem: {
        type: String,
        required: true
    },
    condition: {
        type: String,
        required: true
    },
    numberOfPreviousOwners: {
        type: Number,
        default: null
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
*/
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    address: {
        type: String,
        default: null
    },
    password: {
        type: String,
        required: true
    }
});

const exchangeSchema = new mongoose.Schema({
    initiatingUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    gameOfferedId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: true
    },
    gameRequestedId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date,
        default: null
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

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