const mongoose = require('mongoose');

var categorySchema = new mongoose.Schema({
    categoryName: {
        type: String
    },
    images: {
        type: String,
    },
    unlisted:{
        type:Boolean,
        default:false,
    }

})

const Categorydb = mongoose.model('category', categorySchema)
module.exports = Categorydb