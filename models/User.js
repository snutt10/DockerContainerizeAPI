const mongoose = require('mongoose');

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

module.exports = mongoose.model('User', userSchema, 'users');