const axios = require('axios');
module.exports = class SMS {
    otp;
    msg;
    constructor(mobile) {
        this.mobile = mobile;
        this.otp = SMS.genOtp();
    }

    async sendOtp(msg) {
        this.msg = msg;
        return true;
    }
    static genOtp() {
        return `1234`;
        // return `${Math.floor(1000 + Math.random() * 9000)}`;
    }
    async sendSMS(mobile, otp) {
        // if (process.env.NODE_ENV != 'production') return true;
        // axios.default.get(`https://2factor.in/API/V1/${process.env.SMS_AUTH_KEY}/SMS/${mobile}/${otp}/Otp`)
        //     .then(function(response) {
        //         console.log('...............................the response is', response);
        //         return response;
        //     })
        //     .catch(function(error) {
        //         console.log('AXIOS SMS API ERROR ', error);
        //         // reject(error);
        //     });
        return true;
        // return new Promise((resolve, reject) => {
        //     axios.default.get(`https://2factor.in/API/V1/${process.env.SMS_AUTH_KEY}/SMS/${mobile}/${otp}`)
        //         .then(function(response) {
        //             // console.log(`http://sms.bulksmsserviceproviders.com/api/send_http.php?authkey=${process.env.SMS_AUTH_KEY}&mobiles=${mobile}&message=${message}&sender=${process.env.SMS_SENDER}&route=${process.env.SMS_ROUTE}`);
        //             console.log('...............................the response is', response);
        //             resolve(response);
        //         })
        //         .catch(function(error) {
        //             console.log('AXIOS SMS API ERROR ', error);
        //             reject(error);
        //         });
        // });
    }
}