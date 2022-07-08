const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let matchpricecard = new Schema({

    challengersId: {
        type: mongoose.Types.ObjectId,
        ref: 'challenge',
        default: null
    },
    matchkey: {
        type: mongoose.Types.ObjectId,
        ref: 'listmatch'
    },
    winners: {
        type: String
    },
    price: {
        type: Number,

    },
    price_percent: {
        type: Number,

    },
    min_position: {
        type: Number,

    },
    max_position: {
        type: Number,
    },
    total: {
        type: Number,
        default: 0
    },
    type: {
        type: String
    },
    description: {
        type: String
    }

}, {
    timestamps: true,
    versionKey: false
})

let matchchallengesSchema = new Schema({
    contestid: {
        type: Number
    },
    contest_cat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'contestcategory'
    },
    challenge_id: {
        type: mongoose.Types.ObjectId,
        ref: 'challenge'
    },
    matchkey: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'listmatch'
    },
    fantasy_type: {
        type: String,
        default: 'cricket'
    },
    entryfee: {
        type: Number,
        default: ''
    },
    win_amount: {
        type: Number,
        default: ''
    },
    maximum_user: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        default: 0
    },
    created_by: {
        type: String,
        default: ''
    },
    joinedusers: {
        type: Number,
        default: 0
    },
    bonus_type: {
        type: Number
    },
    contest_type: {
        type: String,
        default: ''
    },
    contest_name:{
        type:String,
        default:''
    },
    amount_type:{
        type:String,
        default:''
    },
    mega_status: {
        type: Number,
        default: 0
    },
    winning_percentage: {
        type: Number,
        default: 0
    },
    is_bonus: {
        type: Number,
        default: 0
    },
    bonus_percentage: {
        type: Number,
        default: 0
    },
    pricecard_type: {
        type: String,
        default: 0
    },
    minimum_user: {
        type: Number,
        default: 0
    },
    confirmed_challenge: {
        type: Number,
        default: 0
    },
    multi_entry: {
        type: Number,
        default: 0
    },
    team_limit: {
        type: Number,
        default: 11
    },
    c_type: {
        type: String,
        default: ''
    },
    is_private: {
        type: Number,
        default: 0
    },
    is_running: {
        type: Number,
        default: 0
    },
    bonus_percentage: {
        type: Number,
        default: 0
    },
    matchpricecards: [matchpricecard],
    is_duplicated: { //When is_running has genrated by cron method updateJoinedusers make its 1 instaed 0
        type: Number,
        default: 0
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    versionKey: false
})
module.exports = mongoose.model('matchchallenge', matchchallengesSchema);