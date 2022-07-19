const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

let ticketorder = new Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    ticketid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'pass'
    },
    seriesid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'series'
    },
    total_tickets: {
        type: Number,
        default: 0
    },
    current_tickets: {
        type: Number,
        default: 0
    },
    able_to_join_contest_fee: {
        type: Number,
        default: 0
    },
    ticket_per_match: {
        type: Number,
        default: 0
    },
    status:{
        type: String,
        default: ''
    },
    purchased_date: {
        type: String,
        default: moment().format("YYYY-MM-DD HH:mm:ss")
    },
    is_deleted: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true,
    versionKey: false
})
module.exports = mongoose.model('ticketorder', ticketorder);