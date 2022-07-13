const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let percentageSchema = new Schema({
    hours: {
        type: Number,
    },
    percentage: {
        type: Number,
    },
},
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = mongoose.model('botpercentage', percentageSchema);