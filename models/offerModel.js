const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')

const offerSchema = new mongoose.Schema({
    category:{
        type:String,
        default:null
    },
    product:{
        type:String,
        default:null
    },
    discount:{
        type:Number,
    },
    offerexpiry:{
        type:Date,
        expires: 0,
    }
    
})

const Offerdb = mongoose.model('offer',offerSchema);

module.exports = Offerdb