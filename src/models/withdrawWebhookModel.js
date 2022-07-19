const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const constant = require('../config/const_credential');

let withdrawWebookSchema = new Schema({
    data: {
        type: 'Object'
    },

}, {
    timestamps: true,
    versionKey: false
})
module.exports = mongoose.model('withdrawWebook', withdrawWebookSchema);