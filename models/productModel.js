const mongoose = require('mongoose')

var userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    mrp:{
        type:Number,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    discount:{
        type:Number,
        required:true,
    },
    category:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    brand:{
        type:String,
        required:true
    },
    color:{
        type:String,
        required:true,
    },
    quantity:{
        type:Number,
        required:true,
    },
    images: [
        {
            type: String,
        }
    ],
    unlisted:{
        type:Boolean,
        default:false,
    }


})

const Productdb = mongoose.model('product',userSchema);

module.exports = Productdb;

// Userdb - Model name
// user -collection name ,where in mongodb it pluralizes it and saves as users