const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const uuid = require('uuid');
var orderSchema = new mongoose.Schema({
    orderid: {
        type: String,
        unique: true
    },
    userid: {
        type: ObjectId
    },
    orderitems: [
        {
            pid: {
                type:ObjectId
            },
            name: {
                type:String
            },
            mrp: {
                type:Number
            },
            price: {
                type:Number
            },
            discount: {
                type:Number
            },
            category: {
                type:String
            },
            description: {
                type:String
            },
            color: {
                type:String
            },
            images: [],
            quantity: {
                type:String
            },
            orderstatus: {
                type:String
            }
        }
    ],
    orderdate: {
        type: Date
    },
    orderstatus: {
        type: String
    },
    paymentmethod: {
        type: String
    },
    address: {
       type:Object
    },
    orderquantity: {
        type: Number
    },
    comments:{
        type:Object
    }

})

const Orderdb = mongoose.model('orderdetail', orderSchema)
module.exports = Orderdb