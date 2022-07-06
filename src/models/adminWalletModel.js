const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let adminWalletSchema = new Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    amount: {
        type: String,
    },
    bonustype: {
        type: String,
        default:null
    },
    description: {
        type: String,
    },
    moneytype: {
        type: String, 
    },
    is_deleted: {
        type: Boolean,
        default:false 
    }
}, {
    timestamps: true,
    versionKey: false
})
module.exports = mongoose.model('adminWallet', adminWalletSchema);