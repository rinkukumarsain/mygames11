const nodemailer = require("nodemailer");
const sendgrid = require('@sendgrid/mail');

const constant = require('../config/const_credential');
sendgrid.setApiKey(constant.SENDGRID_API_KEY);
module.exports = class mail {
    otp;
    msg;
    constructor(email) {
        this.email = email;
        this.otp = mail.genOtp();
    }

    async sendOtp(msg) {
        this.msg = msg;
        return true;
    }
    static genOtp() {
        return `1234`;
        // return `${Math.floor(1000 + Math.random() * 9000)}`;
    }
    async sendMail(email, message, subject) {
        // if (process.env.NODE_ENV != 'production') return true;
        // let mailOptions = {
        //     from: {
        //         name: process.env.APP_NAME,
        //         email: process.env.SENDGRID_EMAIL
        //     },
        //     to: email,
        //     subject: subject,
        //     html: message,
        // };
        // sendgrid.send(mailOptions).then((response) => {
        //     console.log('mail sent...', response);
        // }).catch((error) => {
        //     console.log(`error`, error);
        // })

    }
}