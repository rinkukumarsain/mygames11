const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let refundSchema = new Schema({
    matchkey: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'match'
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    amount: {
        type: Number
    },
    joinid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'joinleague'
    },
    challengeid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'matchchallenge'
    },
    
    reason: {
        type: String
    },
    transaction_id: {
        type: String
    }
}, {
    timestamps: true,
    versionKey: false
})
module.exports = mongoose.model('refund', refundSchema);