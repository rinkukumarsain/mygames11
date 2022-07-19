const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let product = new Schema({
    name: {
        type: String,
        default: ''
    },
    
    description: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    quantity: {
        type: Number,
        default: 0
    },
    is_deleted: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true,
    versionKey: false
})
module.exports = mongoose.model('product', product);