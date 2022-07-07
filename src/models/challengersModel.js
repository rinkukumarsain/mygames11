const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let challengersSchema = new Schema({
    fantasy_type: {
        type: String,
        default: 'Cricket'
    },
    mega_status: {
        type: Number,
        default: 0
    },
    entryfee: {
        type: Number,
        default: 0
    },
    win_amount: {
        type: Number,
        default: 0
    },
    winning_percentage: {
        type: Number,
        default: 0
    },
    maximum_user: {
        type: Number,
        default: 0
    },
    minimum_user: {
        type: Number,
        default: 0
    },
    contest_type: {
        type: String,
        default: ''
    },
    c_type: {
        type: String,
        default: ''
    },
    contest_name:{
        type:String,
        default:''
    },
    multi_entry: {
        type: Number,
        default: 0
    },
    team_limit: {
        type: Number,
        default: 0
    },
    confirmed_challenge: {
        type: Number,
        default: 0
    },
    is_bonus: {
        type: Number,
        default: 0
    },
    is_running: {
        type: Number,
        default: 0
    },
    type: {
        type: String,
        default: ''
    },
    contest_cat: {
        type: mongoose.Types.ObjectId,
        ref: 'contestcategory'
    },
    pricecard_type: {
        type: String,
        default: ''
    },
    freez: {
        type: Number,
        default: 0
    },
    bonus_type: {
        type: String,
        default: ''
    },
    bonus_percentage: {
        type: Number,
        default: 0
    },


}, {
    timestamps: true,
    versionKey: false
})
module.exports = mongoose.model('challenge', challengersSchema);