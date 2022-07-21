const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userbalance = new Schema({
    balance: {
        type: Number,
        default: 0
    },
    winning: {
        type: Number,
        default: 0
    },
    bonus: {
        type: Number,
        default: 0
    },
    ticket: {
        type: Number,
        default: 0
    },
    
    passes: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date
    }
});
// -------------------------------------------------------------//
let user_verify = new Schema({
    profile_image_verify: {
        type: Number,
        default: 0
    },
    mobile_verify: {
        type: Number,
        default: 0
    },
    email_verify: {
        type: Number,
        default: 0
    },
    pan_verify: {
        type: Number,
        default: -1
    },
    bank_verify: {
        type: Number,
        default: -1
    },
    mobilebonus: {
        type: Number,
        default: 0
    },
    androidbonus: {
        type: Number,
        default: 0
    },
    emailbonus: {
        type: Number,
        default: 0
    },
    panbonus: {
        type: Number,
        default: 0
    },
    bankbonus: {
        type: Number,
        default: 0
    },
    signupbonus: {
        type: Number,
        default: 0
    },
    referbonus: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date
    }
});
// -------------------------------------------------------------//
let pancard = new Schema({
    pan_name: {
        type: String
    },
    pan_number: {
        type: String
    },
    pan_dob: {
        type: String
    },
    image: {
        type: String
    },
    status: {
        type: Number
    },
    comment: {
        type: String
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date
    }
});
// -------------------------------------------------------------//
let bank = new Schema({
    accountholder: {
        type: String
    },
    accno: {
        type: String
    },
    ifsc: {
        type: String
    },
    bankname: {
        type: String
    },
    bankbranch: {
        type: String
    },
    state: {
        type: String
    },
    status: {
        type: Number
    },
    image: {
        type: String
    },
    comment: {
        type: String
    },
    type: {
        type: String
    },
    mobile: {
        type: String
    },
    upi_id: {
        type: String
    },
    gname: {
        type: String
    },
    iagree: {
        type: String
    },
    cashfree_status: {
        type: Number
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date
    }
});
// -------------------------------------------------------------//
let bonusRefered = new Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    amount: {
        type: Number,
        default: 0
    },
    txnid: {
        type: String
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date
    }
});
// -------------------------------------------------------------//

// MAIN SCHEMA----------------------------------******************
let userSchema = new Schema({
    userid: {
        type: Number
    },
    fullname: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    mobile: {
        type: Number,
        default: 0
    },
    password: {
        type: String,
        default: ''
    },
    code: {
        type: String,
        default: ''
    },
    auth_key: {
        type: String,
        default: ''
    },
    app_key: {
        type: String,
        default: ''
    },
    decrypted_password: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        default: 'activated'
    },
    refer_code: {
        type: String,
        default: ''
    },
    refer_id: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
    },
    special_refer: {
        type: String,
        default: ''
    },
    username: {
        type: String,
        default: ''
    },
    dob: {
        type: String,
        default: ''
    },
    gender: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    comment: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    state: {
        type: String,
        default: ''
    },
    pincode: {
        type: Number,
        default: 0
    },
    activation_status: {
        type: String,
        default: ''
    },
    team: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        default: ''
    },
    percentage: {
        type: Number
    },
    download_apk: {
        type: Number
    },
    remember_token: {
        type: String
    },
    user_status: {
        type: Number
    },
    deviceid: {
        type: String
    },
    withdrawamount: {
        type: Number,
        default: 0
    },
    winstatus: {
        type: Number,
        default: 0
    },
    userbalance: userbalance,
    user_verify: user_verify,
    pancard: pancard,
    bank: bank,
    bonusRefered: [bonusRefered],
    totalrefercount: {
        type: Number
    },
    percentage:{
        type:Number,
        default:0
    },
    totalchallenges: {
        type: Number,
        default: 0
    },
    totalmatches: {
        type: Number,
        default: 0
    },
    totalseries: {
        type: Number,
        default: 0
    },
    totalwinning: {
        type: Number,
        default: 0
    },
    totalwoncontest: {
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
module.exports = mongoose.model('user', userSchema);