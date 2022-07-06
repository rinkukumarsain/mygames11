const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let JoinTeamSchema = new Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    matchkey: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'listmatch'
    },
    teamnumber: {
        type: Number,
        default: 0
    },
    players: {
        type: Array,
        ref: 'player'
    },
    // playersArray: {
    //     type: String
    // },
    captain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'player'
    },
    vicecaptain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'player'
    },
    points: {
        type: Number,
        default: 0.0
    },
    lastpoints: {
        type: Number,
        default: 0.0
    },
    player_type: {
        type: String,
        default: 'classic'
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    versionKey: false
})
module.exports = mongoose.model('jointeam', JoinTeamSchema);