const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let contestcategorySchema = new Schema({
    fantasy_type: {
        type: String,
        default: 'cricket'
    },
    name: {
        type: String,
        default: ''
    },
    sub_title: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    tbl_order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    versionKey: false
})
module.exports = mongoose.model('contestcategory', contestcategorySchema);