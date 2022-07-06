const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let tdsDetailSchema = new Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    challengeid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'matchchallenge'
    },
    
    seriesid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'series'
    },
    amount: {
        type: Number
    },
    tds_amount: {
        type: Number
    }
}, {
    timestamps: true,
    versionKey: false
})
module.exports = mongoose.model('tdsdetail', tdsDetailSchema);