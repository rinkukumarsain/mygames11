const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let matchSchema = new Schema({
    id: {
        type: Number
    },
    matchkey: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'listMatches'
    },
    playerid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'player'
    },
    points: {
        type: Number,
        default: 0
    },
    role: {
        type: String,
        default: ''
    },
    credit: {
        type: Number,
        default: 9
    },
    name: {
        type: String
    },
    legal_name: {
        type: String
    },
    battingstyle: {
        type: String,
        default: ''
    },
    bowlingstyle: {
        type: String,
        default: ''
    },
    playingstatus: {
        type: Number,
        default: -1
    },
    playingtime: {
        type: Number
    },
    vplaying: {
        type: Number,
        default: 0
    },
    userteam: {
        type: Number
    },
    players_count: {
        type: Number,
        default: 0
    },
    totalSelected: {
        type: Number,
        default: 0
    },
    captainSelected: {
        type: Number,
        default: 0
    },
    vicecaptainSelected: {
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
});


module.exports = mongoose.model('matchplayer', matchSchema);