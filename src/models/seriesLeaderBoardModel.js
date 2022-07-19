const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let teamSchema = new Schema({
    fantasy_type: {
        type: String,
        default:"Cricket"
    },
    points: {
        type: Number,
        default:0
    },
    matchkey: {
        type: mongoose.Types.ObjectId,
        ref:'matchchallenge'
    },
    userid: {
        type: mongoose.Types.ObjectId,
        ref:'user'
    },
    series_id: {
        type: mongoose.Types.ObjectId,
        ref:'series'
    },
    teamid: {
        type: mongoose.Types.ObjectId,
        ref:'team'
    },
    teamnumber: {
        type: Number,
        default:0
    },
    data: {
        type: String,
        default:''
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    versionKey: false
})
module.exports = mongoose.model('series_leaderboard', teamSchema);