const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const constant = require('../config/const_credential');

let Offers = new Schema({
    adminId:{
        type:mongoose.Types.ObjectId
    },
    min_amount: {
        type: Number,
    },
    max_amount: {
        type: Number,
    },
    bonus: {
        type: Number,
    },
    offer_code: {
        type: String,
    },
    bonus_type: {
        type: String,
    },
    title: {
        type: String,
    },
    start_date: {
        type: String,
    },
    image:{
        type:String
    },
    expire_date: {
        type: String,
    },
    user_time: {
        type: Number,
    },
    type: {
        type: String,
    },
    amt_limit: {
        type: Number,
    },
    description: {
        type: String,
    },
    is_deleted: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true,
    versionKey: false
})
module.exports = mongoose.model('offers', Offers);