const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let leaugestransaction = new Schema({
        bonus: {
            type: Number,
            default: 0
        },
        winning: {
            type: Number,
            default: 0
        },
        balance: {
            type: Number,
            default: 0
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    }, {
        timestamps: true,
        versionKey: false
    })
    // --------------------------------------------------------------//
let joinedleaugeSchema = new Schema({
    refercode: {
        type: String,
        default: ''
    },
    transaction_id: {
        type: String,
        default: ''
    },
    teamNumbercount: {
        type: Number,
        defalut: 0
    },
    sta: {
        type: Number,
        defalut: 0
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    challengeid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'matchchallenges'
    },
    teamid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'team'
    },
    matchkey: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'listmatch'
    },
    seriesid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'series'
    },
    leaugestransaction: leaugestransaction,
    is_deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    versionKey: false
})
module.exports = mongoose.model('joinedleauge', joinedleaugeSchema);