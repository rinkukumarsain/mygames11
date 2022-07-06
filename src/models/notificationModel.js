const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Notification = new Schema({
    userid: {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    },
    title: {
        type: String
    },
    transaction_id: {
        type: String
    },
    seen: {
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
module.exports = mongoose.model('notification', Notification);