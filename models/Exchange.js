const mongoose = require('mongoose');

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

module.exports = mongoose.model('Exchange', exchangeSchema, 'exchange');