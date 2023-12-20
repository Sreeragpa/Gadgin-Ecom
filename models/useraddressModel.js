const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

var addressSchema = new mongoose.Schema({
    userid: {
        type: ObjectId
    },
    address: [
        {
            name:{
                type:String
            },
            house:{
                type:String
            },
            pincode:{
                type:Number
            },
            phone:{
                type:Number
            },
            defaultaddress:{
                type:Boolean,
                default:false
            },
            createdAt:Date,
        }
    ]

})

const Addressdb = mongoose.model('useraddress', addressSchema)
module.exports = Addressdb