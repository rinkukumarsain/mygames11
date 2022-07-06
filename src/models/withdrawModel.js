const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const constant = require('../config/const_credential');

let withdrawSchema = new Schema({
    userid: {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    },
    amount: {
        type: Number,
        default: 0
    },
    beneld: {
        type: String,
        default: null
    },
    tranfer_id: {
        type: String,
        default: null
    },
    withdraw_req_id: {
        type: String,
        default: null
    },
    comment: {
        type: String,
        default: ''
    },
    approved_date: {
        type: String,
    },
    status: {
        type: Number,
        default: 0
    },
    type: {
        type: String,
        default: null
    },
    paytm_number: {
        type: Number,
        default: null
    },
    withdrawfrom: {
        type: String,
        default: null
    },
    is_deleted: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true,
    versionKey: false
})
module.exports = mongoose.model('withdraw', withdrawSchema);