const mongoose = require('mongoose');

var categorySchema = new mongoose.Schema({
    categoryName: {
        type: String
    },
    images: {
        type: String,
    }

})

const Categorydb = mongoose.model('category', categorySchema)
module.exports = Categorydb