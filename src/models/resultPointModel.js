const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let matchPointSchema = new Schema({
    matchkey: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'match'
    },
    player_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'players'
    },
    resultmatch_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'resultmatch'
    },
    startingpoints: {
        type: Number
    },
    runs: {
        type: Number
    },
    sixs: {
        type: Number
    },
    fours: {
        type: Number
    },
    strike_rate: {
        type: Number
    },
    century: {
        type: Number
    },
    halfcentury: {
        type: Number
    },
    thirtypoints: {
        type: Number,
        default: '0'
    },
    wicketbonuspoint: {
        type: Number,
        default: '0'
    },
    catch: {
        type: Number
    },
    wickets: {
        type: Number
    },
    maidens: {
        type: Number
    },
    
    economy_rate: {
        type: Number
    },
    runouts: {
        type: Number
    },
    stumping: {
        type: Number
    },
    thrower: {
        type: Number
    },
    
    hitter: {
        type: String
    },
    
    bonus: {
        type: Number
    },
    
    negative: {
        type: Number
    },
    total: {
        type: Number
    },
    
}, {
    timestamps: true,
    versionKey: false
})
module.exports = mongoose.model('resultpoint', matchPointSchema);