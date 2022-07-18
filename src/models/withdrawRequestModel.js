const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const constant = require('../config/const_credential');

let withdrawRequestSchema = new Schema({
    withdrawid: {
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
    transferId: {
        type: String,
        default: null
    },

    remarks: {
        type: String,
        default: null
    },

}, {
    timestamps: true,
    versionKey: false
})
module.exports = mongoose.model('withdrawRequest', withdrawRequestSchema);