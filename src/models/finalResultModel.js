const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let finalResultSchema = new Schema({
    matchkey: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'match'
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    challengeid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'matchchallenge'
    },
    joinedid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'joinleague'
    },
    seriesid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'series'
    },
    transaction_id: {
        type: String
    },
    points: {
        type: Number
    },
    amount: {
        type: Number
    },
    rank: {
        type: Number
    },
    status: {
        type: Number,
        default: 1
    },
}, {
    timestamps: true,
    versionKey: false
})
module.exports = mongoose.model('finalresult', finalResultSchema);