const mongoose = require('mongoose')

var otpverificationSchema = new mongoose.Schema({
    userId:{
        type:String,
    },
    otp:{
        type:Number,
    },
    createdAt:Date,
    expiresAt:{
        type:Date,
        expires:0
    },
})
otpverificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const Otpdb = mongoose.model('otp',otpverificationSchema);

module.exports = Otpdb;