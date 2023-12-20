const mongoose = require('mongoose');

var UnlistedcategorySchema = new mongoose.Schema({
    categoryName: {
        type: String
    },
    images: {
        type: String,
    }

})

const UnlistedCategorydb = mongoose.model('unlistedcategory', UnlistedcategorySchema)
module.exports = UnlistedCategorydb