const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let PaymentProcess = new Schema({
    userid: {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    },
    offerid: {
        type: String,
        default: ''
    },
    paymentmethod: {
        type: String,
        default: ''
    },
    amount: {
        type: Number,
        default: 0
    },
    orderid: {
        type: String,
        default: ''
    },
    returnid: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        default: 'pending'
    }
}, {
    timestamps: true,
    versionKey: false
})
module.exports = mongoose.model('PaymentProcess', PaymentProcess);