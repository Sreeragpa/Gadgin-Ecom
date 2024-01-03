const mongoose = require('mongoose');
const couponSchema = new mongoose.Schema({
    couponcode:{
        type:String,
        required:true
    },
    coupondiscount:{
        type:Number,
        required:true
    },
    couponcount:{
        type:Number,
        default:Infinity
    },
    couponexpiry:{
        type:Date,
        required:true
    },
    offertype:{
        category:{
            type:String,
            default:"all"
        },
        priceabove:{
            type:Number,
            default:1
        },
        pricebelow:{
            type:Number,
            default:Infinity,
        }
    }
  
})

const Coupondb = mongoose.model('coupons',couponSchema);
module.exports = Coupondb


