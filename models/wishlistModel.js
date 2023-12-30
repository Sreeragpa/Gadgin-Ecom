const { ObjectId } = require("mongodb")
const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const wishlistSchema = new mongoose.Schema({
    userid:{
        type:ObjectId,
    },
    products:[
        {
            type:Schema.Types.ObjectId,
            ref:'product'
        }
    ]
})

const Wishlistdb = mongoose.model('wishlist',wishlistSchema);

module.exports = Wishlistdb

