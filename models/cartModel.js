const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

var cartSchema = new mongoose.Schema({
    userid: {
        type: ObjectId
    },
    cartitems: [
        {
            productid:{
                type:ObjectId
            },
            quantity:{
                type:Number,
                default:1
            },
            createdAt:Date,
        }
    ]

})

const Cartdb = mongoose.model('cart', cartSchema)
module.exports = Cartdb