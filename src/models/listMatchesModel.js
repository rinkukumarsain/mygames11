const mongoose = require('mongoose');

let listmatchSchema = new mongoose.Schema({
    fantasy_type: {
        type: String
    },
    type: {
        type: String
    },
    name: {
        type: String
    },
    short_name: {
        type: String,
        default: ''
    },
    team1Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'team'
    },
    team2Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'team'
    },
    matchkey: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'listmatch'
    },
    real_matchkey: {
        type: String
    },
    series: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'series'
    },
    start_date: {
        type: String
    },
    status: {
        type: String
    },
    launch_status: {
        type: String
    },
    info_center:{
        type: String,
        default:''
    },
    final_status: {
        type: String
    },
    playing11_status: {
        type: Number,
        default: 0
    },
    order_status: {
        type: Number,
        default: 0
    },
    status_overview: {
        type: String
    },
    squadstatus: {
        type: String,
        default: 'YES'
    },
    pdfstatus: {
        type: Number
    },
    pointsstatus: {
        type: Number
    },
    withdraw_amount: {
        type: Number
    },
    format: {
        type: String
    },
    report_status: {
        type: String
    },
    second_inning_status: {
        type: Number
    },
    tosswinner_team: {
        type: Number
    },
    toss_decision: {
        type: String
    },
    is_deleted: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('listMatches', listmatchSchema);