const mongoose = require('mongoose')

var otpverificationSchema = new mongoose.Schema({
    userId:{
        type:String,
    },
    otp:{
        type:Number,
    },
    createdAt:Date,
    expiresAt:Date,
})

const Otpdb = mongoose.model('otp',otpverificationSchema);

module.exports = Otpdb;