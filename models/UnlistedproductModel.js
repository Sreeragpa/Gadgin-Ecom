const mongoose = require('mongoose')

var productSchema = new mongoose.Schema({
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
    ]

})

const UnlistedProductdb = mongoose.model('Unlistedproduct',productSchema);

module.exports = UnlistedProductdb;

// Userdb - Model name
// user -collection name ,where in mongodb it pluralizes it and saves as users