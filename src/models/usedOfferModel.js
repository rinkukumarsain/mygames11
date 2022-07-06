const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let usedOffer = new Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    },
    offer_id: {
        type: mongoose.Types.ObjectId,
        ref: 'offers'
    },
    is_deleted: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true,
    versionKey: false
})
module.exports = mongoose.model('usedOffer', usedOffer);


