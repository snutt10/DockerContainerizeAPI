const mongoose = require('mongoose');

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

module.exports = mongoose.model('Game', gameSchema, 'games');