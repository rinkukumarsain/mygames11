const mongoose = require("mongoose");

const seriesData = new mongoose.Schema({
    fantasy_type: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    series_key: {
        type: String
    },
    status: {
        type: String,
        default: 'opened'
    },
    start_date: {
        type: String,
        required: true
    },
    end_date: {
        type: String,
        required: true
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    versionKey: false
})

module.exports = mongoose.model('series', seriesData);