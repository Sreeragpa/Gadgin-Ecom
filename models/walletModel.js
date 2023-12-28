const { ObjectId, Timestamp } = require('mongodb');
const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    userid: {
        type: ObjectId,
        required: true,
        unique: true
    },
    walletbalance: {
        type: Number,
        default: 0
    },
    transactions: [{
        amount: {
            type: Number,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        debit:{
            type: Boolean,
            default: false
        },
        credit:{
            type: Boolean,
            default: false
        }
    }]
})

const Walletdb = mongoose.model('userwallet',walletSchema);

module.exports = Walletdb