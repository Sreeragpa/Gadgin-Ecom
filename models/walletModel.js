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
        },
        status:{
            type:String,
            default:null
        },
        transactionid:{
            type:String,
            required:true
        },
        razorpay_payment_id:{
            type:String,
            default:null
        },
        razorpay_order_id:{
            type:String,
            default:null
        },
        razorpay_signature:{
            type:String,
            default:null
        },
    }],

})

const Walletdb = mongoose.model('userwallet',walletSchema);

module.exports = Walletdb