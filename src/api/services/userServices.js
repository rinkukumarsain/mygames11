const mongoose = require('mongoose');
const randomstring = require("randomstring");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const moment = require('moment');
const path = require('path');
const hmacSHA256 = require('crypto-js/hmac-sha256');
const Base64 = require('crypto-js/hmac-sha256');

const userModel = require('../../models/userModel');
const tempuserModel = require('../../models/tempUserModel');
const TransactionModel = require('../../models/transactionModel');
const NotificationModel = require('../../models/notificationModel');
const AdminModel = require('../../models/adminModel');
const WithdrawModel = require('../../models/withdrawModel');
const PaymentProcessModel = require('../../models/PaymentProcessModel');
const OfferModel = require('../../models/offerModel');
const usedOfferModel = require('../../models/usedOfferModel');

const constant = require('../../config/const_credential');
const NOTIFICATION_TEXT = require('../../config/notification_text');
const notification = require('../../utils/notifications');
const appUtils = require("../../utils/appUtils");
const SMS = require('../../utils/sms');
const Mail = require('../../utils/mail');
const GetBouns = require('../../utils/getBonus');


class userServices {
    constructor() {
        return {
            // userLogin: this.userLogin.bind(this),
            addTempuser: this.addTempuser.bind(this),
            registerUser: this.registerUser.bind(this),
            loginuser: this.loginuser.bind(this),
            loginuserOTP: this.loginuserOTP.bind(this),
            getVersion: this.getVersion.bind(this),
            getmainbanner: this.getmainbanner.bind(this),
            getwebslider: this.getwebslider.bind(this),
            uploadUserImage: this.uploadUserImage.bind(this),
            resendOTP: this.resendOTP.bind(this),
            verifyMobileNumber: this.verifyMobileNumber.bind(this),
            verifyEmail: this.verifyEmail.bind(this),
            verifyCode: this.verifyCode.bind(this),
            allverify: this.allverify.bind(this),
            userFullDetails: this.userFullDetails.bind(this),
            logoutUser: this.logoutUser.bind(this),
            myTransactions: this.myTransactions.bind(this),
            editProfile: this.editProfile.bind(this),
            forgotPassword: this.forgotPassword.bind(this),
            matchCodeForReset: this.matchCodeForReset.bind(this),
            resetPassword: this.resetPassword.bind(this),
            changePassword: this.changePassword.bind(this),
            panRequest: this.panRequest.bind(this),
            panDetails: this.panDetails.bind(this),
            bankRequest: this.bankRequest.bind(this),
            bankDetails: this.bankDetails.bind(this),
            getBalance: this.getBalance.bind(this),
            myWalletDetails: this.myWalletDetails.bind(this),
            requestWithdraw: this.requestWithdraw.bind(this),
            myWithdrawList: this.myWithdrawList.bind(this),
            requestAddCash: this.requestAddCash.bind(this),
            webhookDetail: this.webhookDetail.bind(this),
            socialAuthentication: this.socialAuthentication.bind(this),
            getNotification: this.getNotification.bind(this),
            getOffers: this.getOffers.bind(this),
            givebonusToUser: this.givebonusToUser.bind(this)
        }
    }

    /**
     * @function genrateReferCode
     * @description using this function to generate refercode for user
     * @param {mobile}
     * @author Devanshu Gautam
     */
    async genrateReferCode(mobile) {
        const char = String(mobile).substring(0, 4);
        const coupon = randomstring.generate({ charset: 'alphanumeric', length: 4 });
        let referCode = `${constant.APP_SHORT_NAME}-${char}${coupon.toUpperCase()}`;
        const checkReferCode = await userModel.findOne({ refer_code: referCode });
        if (checkReferCode) {
            await genrateReferCode(mobile);
        }
        return referCode;
    }

    /**
     * @function findTempUser
     * @description using this function in other functions to run find query for temp user
     * @param data in form of an obj is required to search the data accordingly
     * @author Devanshu Gautam
     */
    async findTempUser(data) {
        let result = await tempuserModel.find(data);
        return result;
    }

    /**
     * @function findUser
     * @description using this function in other functions to run find query for user 
     * @param data in form of an obj is required to search the data accordingly
     * @author Devanshu Gautam
     */
    async findUser(data) {
        let result = await userModel.find(data);
        return result;
    }

    /**
     * @function addTempUser
     * @description User Id storing for temproary
     * @param { email,mobile,password,refercode,fullname} req.body
     * @author Devanshu Gautam
     */
    async addTempuser(req) {
        try {
            let obj = {};
            if (req.body.email) {
                let whereObj = {
                    email: req.body.email
                };
                obj.email = req.body.email
                let data = await this.findUser(whereObj);
                if (data.length > 0) {
                    return {
                        message: "The email address you have entered is already in use.",
                        status: false,
                        data: { email: data[0].email }
                    };
                }
            }
            if (req.body.mobile) {
                let whereObj = {
                    mobile: req.body.mobile
                };
                obj.mobile = req.body.mobile
                let data = await this.findUser(whereObj);
                if (data.length > 0) {
                    return {
                        message: "The mobile number you have entered is already in use.",
                        status: false,
                        data: { mobile: data[0].mobile }
                    };
                }
            }
            let salt = bcrypt.genSaltSync(10);
            req.body.password = bcrypt.hashSync(req.body.password, salt);
            let userREf = await userModel.findOne({ refer_code: req.body.refercode })
            const referId = req.body.refercode && req.body.refercode != '' ? userREf ? userREf.refer_code : null : null;
            const sms = new SMS(req.body.mobile);
            await sms.sendSMS(
                sms.mobile,
                sms.otp,
                // `${sms.otp} is the OTP for your ${constant.APP_NAME} account. NEVER SHARE YOUR OTP WITH ANYONE. ${constant.APP_NAME} will never call or message to ask for the OTP.`
            );
            let tempuser = await this.findTempUser(obj);
            if (tempuser.length > 0) {
                let userFound = await tempuserModel.findOneAndUpdate({ $or: [{ email: req.body.email || '' }, { mobile: req.body.mobile || '' }] }, {
                    email: req.body.email,
                    mobile: req.body.mobile,
                    password: req.body.password,
                    username: req.body.fullname || '',
                    refer_id: referId,
                    code: sms.otp || '1234',
                }, {
                    new: true,
                    upsert: true,
                })
                if (userFound) {
                    return {
                        message: "OTP is Sent to youe mobile number",
                        status: true,
                        data: { tempUser: userFound._id }
                    };
                }
            } else {
                let addTempuserData = new tempuserModel({
                    email: req.body.email,
                    mobile: req.body.mobile,
                    password: req.body.password,
                    username: req.body.fullname || '',
                    refer_id: referId,
                    code: sms.otp,
                });
                const insertTempuser = await addTempuserData.save();
                if (insertTempuser) {
                    return {
                        message: "OTP is Sent to youe mobile number",
                        status: true,
                        data: { tempUser: insertTempuser._id },
                    };
                }
            }
        } catch (error) {
            throw error;
        }

    }

    /**
     * @function registerUser
     * @description Save User to registeruser and remove from temporry database
     * @param { tempuser,mobile,email} req.body
     * @author Devanshu Gautam
     */
    async registerUser(req) {
        try {
            let TempUserWhereObj = {
                _id: req.body.tempuser,
                code: req.body.otp,
            }
            const findTempUser = await this.findTempUser(TempUserWhereObj);
            if (findTempUser.length == 0) return { message: "Invalid OTP", status: false, data: {} };
            // console.log(`findTempUser[0]`, findTempUser[0]);
            let mobileBonus = await new GetBouns().getBonus(constant.BONUS_TYPES.MOBILE_BONUS, constant.PROFILE_VERIFY_BONUS_TYPES_VALUES.FALSE)
            const getReferCode = await this.genrateReferCode(findTempUser[0].mobile);
            console.log(`mobileBonus`, {
                ...findTempUser[0]._doc,
                refer_code: getReferCode,
                user_verify: { mobile_verify: 1, mobilebonus: 1 },
                userbalance: { bonus: Number(mobileBonus) },
            });
            let adduserData = new userModel({
                ...findTempUser[0]._doc,
                refer_code: getReferCode,
                user_verify: { mobile_verify: 1, mobilebonus: 1 },
                userbalance: { bonus: Number(mobileBonus) },
                app_key: req.body.appid || ''
            });
            let user = await adduserData.save();
            const token = jwt.sign({ _id: user._id.toString() }, process.env.SECRET_TOKEN);
            if (findTempUser[0].refer_id != null && findTempUser[0].refer_id) {
                await userModel.updateOne({ _id: findTempUser[0].refer_id }, { $inc: { totalrefercount: 1 } });
            }
            await Promise.all([
                tempuserModel.deleteOne({ _id: req.body.tempuser }),
                TransactionModel.create({
                    userid: user._id,
                    type: constant.BONUS.MOBILE_BONUS,
                    transaction_id: `${constant.APP_SHORT_NAME}-EBONUS-${Date.now()}`,
                    amount: mobileBonus,
                    bonus_amt: mobileBonus,
                    bal_bonus_amt: mobileBonus,
                    total_available_amt: mobileBonus,
                }),
                NotificationModel.create({
                    title: NOTIFICATION_TEXT.BONUS.BODY(mobileBonus, constant.BONUS_NAME.mobilebonus),
                    userid: user._id,
                })
            ]);

            return {
                message: "Registration Done....",
                status: true,
                data: { auth_key: '', userid: '', token },
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function updateUserBalanceAndUserVerify
     * @description Update balance and user_verify details
     * @param { bonusamount,userId,type,verifyType,username} payload
     * @author Devanshu Gautam
     */
    async updateUserBalanceAndUserVerify(data) {
        // console.log(`data----------------------------------`, data);
        const update = {};
        update['$inc'] = { 'userbalance.bonus': data.bonusamount };
        update['code'] = '';
        if (data.verifyType != '') update[`user_verify.${data.verifyType}`] = 1;
        if (data.type != constant.PROFILE_VERIFY_BONUS_TYPES.REFER_BONUS)
            update[`user_verify.${data.type}`] = 1;
        return await userModel.findOneAndUpdate({ _id: data.userId }, update, { new: true });
    }

    /**
     * @function givebonusToUser
     * @description Give bonus to user verification and refering
     * @param { bonusamount,userId,type,verifyType}
     * @author Devanshu Gautam
     */
    async givebonusToUser(bonusamount = 0, userId, type, verifyType = '', referUser = null) {
        // console.log(bonusamount, '------------', userId, '-----------------', type, '----------', verifyType);
        const transaction_id = `${constant.APP_SHORT_NAME}-EBONUS-${Date.now()}`;
        const balanceUpdate = await this.updateUserBalanceAndUserVerify({ bonusamount, type, verifyType, userId });
        await TransactionModel.create({
            userid: userId,
            type: constant.BONUS_NAME[type],
            transaction_id,
            transaction_by: constant.TRANSACTION_BY.APP_NAME,
            amount: bonusamount,
            paymentstatus: constant.PAYMENT_STATUS_TYPES.CONFIRMED,
            challengeid: null,
            seriesid: null,
            joinid: null,
            bonus_amt: bonusamount,
            win_amt: 0,
            addfund_amt: 0,
            bal_bonus_amt: balanceUpdate.userbalance.bonus || 0,
            bal_win_amt: balanceUpdate.userbalance.balance || 0,
            bal_fund_amt: balanceUpdate.userbalance.winning || 0,
            total_available_amt: balanceUpdate.userbalance.balance || 0 + balanceUpdate.userbalance.winning || 0 + balanceUpdate.userbalance.bonus || 0,
            withdraw_amt: 0,
            challenge_join_amt: 0,
            cons_bonus: 0,
            cons_win: 0,
            cons_amount: 0,
        });
        if (type == constant.PROFILE_VERIFY_BONUS_TYPES.REFER_BONUS) {
            const dataToSave = {
                $push: {
                    bonusRefered: {
                        userid: mongoose.Types.ObjectId(referUser),
                        amount: bonusamount,
                        txnid: transaction_id,
                    },
                },
            };
            await userModel.findOneAndUpdate({ _id: userId }, dataToSave, { new: true });
        }

        const notificationObject = {
            receiverId: userId,
            deviceTokens: balanceUpdate.app_key,
            type: NOTIFICATION_TEXT.BONUS,
            title: NOTIFICATION_TEXT.BONUS.TITLE(constant.BONUS_NAME[type]),
            message: NOTIFICATION_TEXT.BONUS.BODY(bonusamount, constant.BONUS_NAME[type]),
            entityId: userId,
        };
        await NotificationModel.create({
            title: notificationObject.message,
            userid: userId,
        });

        if (!balanceUpdate.app_key) {
            return true;
        }
        await notification.PushNotifications(notificationObject);
        return true;
    }

    /**
     * @function loginuser
     * @description Login User By email and password And when mobile send OTP to login
     * @param { mobile,email,appid } req.body
     * @author Devanshu Gautam
     */
    async loginuser(req) {
        if (req.body.mobile) {
            let obj = {
                mobile: req.body.mobile
            }
            const user = await this.findUser(obj);
            if (user.length == 0) {
                return {
                    message: "This mobile number is not registered.",
                    status: false,
                    data: { auth_key: 0, userid: 0 },
                };
            }
            if (user[0].status.toLowerCase() == 'blocked') {
                return {
                    message: "You cannot login now in this account. Please contact to administartor.",
                    status: false,
                    data: { auth_key: 0, userid: 0 },
                };
            }
            const sms = new SMS(req.body.mobile);
            const otpsent = await sms.sendSMS(
                sms.mobile,
                sms.otp,
                // `${sms.otp} is the OTP for your ${constant.APP_NAME} account. NEVER SHARE YOUR OTP WITH ANYONE. ${constant.APP_NAME} will never call or message to ask for the OTP.`
            );
            await userModel.updateOne({ mobile: req.body.mobile }, { code: sms.otp });

            return {
                message: "OTP sent on your mobile number",
                status: true,
                data: {},
            };
        }
        if (req.body.email && req.body.password) {
            let obj = {
                email: req.body.email
            }
            const user = await this.findUser(obj);
            console.log(`user`, user, req.body.email);
            if (user.length == 0) {
                return {
                    message: "Invalid username or Password.",
                    status: false,
                    data: { auth_key: 0, userid: 0 },
                };
            }
            if (user[0].status.toLowerCase() == 'blocked') {
                return {
                    message: "You cannot login now in this account. Please contact to administartor.",
                    status: false,
                    data: { auth_key: 0, userid: 0 },
                };
            }
            if (!(await bcrypt.compare(req.body.password, user[0].password))) {
                return {
                    message: "Invalid username or Password.",
                    status: false,
                    data: { auth_key: 0, userid: 0 },
                };
            }
            const token = jwt.sign({ _id: user[0]._id.toString(), refer_code: user[0].refer_code }, process.env.SECRET_TOKEN);
            await userModel.updateOne({ _id: user[0]._id }, { auth_key: token, app_key: req.body.appid || '' }, { new: true });
            return {
                message: "Login Successfully.",
                status: true,
                data: {
                    token,
                    auth_key: token,
                    userid: user[0]._id,
                    type: user[0].type ? `${user[0].type} ${constant.USER_TYPE.USER}` : constant.USER_TYPE.NORMAL_USER,
                }
            };
        }
        return {
            message: "Invalid username.",
            status: false,
            data: { auth_key: 0, userid: 0 },
        };
    }

    /**
     * @function logoutUser
     * @description User Logout
     * @param {  } req.body only take auth key from header
     * @author Devanshu Gautam
     */
    async logoutUser(req) {
            const user = await userModel.findOne({ _id: req.user._id });
            if (!user) {
                return {
                    message: 'user not found ...!',
                    status: false,
                    data: {}
                }
            }
            await userModel.updateOne({ _id: user._id }, { app_key: '' }, { new: true });
            return {
                message: 'Logout successfully..',
                status: true,
                data: {}
            }
        }
        /**
         * @function loginuserOTP
         * @description Login User By mobile and otp
         * @param { mobile,otp,appid } req.body
         * @author Devanshu Gautam
         */
    async loginuserOTP(req) {
        const user = await this.findUser({ mobile: req.body.mobile, code: req.body.otp });
        if (user.length == 0) {
            return {
                message: "Invalid OTP.",
                status: false,
                data: { auth_key: 0, userid: 0 },
            }
        }
        if (user[0].status.toLowerCase() == 'blocked') {
            return {
                message: "You cannot login now in this account. Please contact to administartor.",
                status: false,
                data: { auth_key: 0, userid: 0 },
            }
        }
        const token = jwt.sign({ _id: user[0]._id.toString(), refer_code: user[0].refer_code }, process.env.SECRET_TOKEN);
        await userModel.updateOne({ _id: user[0]._id }, { auth_key: token, app_key: req.body.appid || '' }, { new: true });
        return {
            message: "Login Successfully.",
            status: true,
            data: {
                token,
                auth_key: token,
                userid: user[0]._id,
                type: user[0].type ? `${user[0].type} ${constant.USER_TYPE.USER}` : constant.USER_TYPE.NORMAL_USER,
            }
        };
    }

    /**
     * @function getVersion
     * @description Get Version API for Android and IOS applicationn
     * @param {  } getVeriosn by default return android
     * @author Devanshu Gautam
     */
    async getVersion(req) {
        const superAdmin = await AdminModel.findOne({ role: constant.ADMIN.SUPER_ADMIN });
        console.log(`superAdmin`, superAdmin);
        if (!superAdmin.androidversion) return { status: false, message: 'Something went wrong', data: { status: '', point: '' } };
        return {
            message: "Android Version Details...!",
            status: true,
            data: {
                version: superAdmin.androidversion.version,
                point: superAdmin.androidversion.updation_points,
            }
        };
    }

    /**
     * @function getmainbanner
     * @description Get Main Banner api
     * @param {  }
     * @author Devanshu Gautam
     */
    async getmainbanner(req) {
        const superAdmin = await AdminModel.findOne({ role: constant.ADMIN.SUPER_ADMIN });
        console.log(`superAdmin`, superAdmin);
        let images;
        if (superAdmin) {
            images = superAdmin.sidebanner ? superAdmin.sidebanner.filter(item => item.type == constant.SIDE_BANNER_TYPES.APP_TYPE) : [];
        } else {
            image = [];
        }
        const image = await images.map(item => {
            return {
                image_local: `${process.env.BASE_URL_LOCAL}${item.image}`,
                image: `${process.env.BASE_URL}${item.image}`
            }
        });
        return {
            message: "Main Banner...!",
            status: true,
            data: image

        };
    }

    /**
     * @function getwebslider
     * @description Get Banner slider images
     * @param {  }
     * @author Devanshu Gautam
     */
    async getwebslider(req) {
        const superAdmin = await AdminModel.findOne({ role: constant.ADMIN.SUPER_ADMIN });
        console.log(`superAdmin`, superAdmin);
        let images;
        if (superAdmin) {
            images = superAdmin.sidebanner ? superAdmin.sidebanner.filter(item => item.type == constant.SIDE_BANNER_TYPES.WEB_TYPE) : [];
        } else {
            image = [];
        }
        const image = await images.map(item => {
            return {
                image_local: `${process.env.BASE_URL_LOCAL}${item.image}`,
                image: `${process.env.BASE_URL}${item.image}`
            }
        });
        return {
            message: "Main Banner...!",
            status: true,
            data: image[0]
        };
    }

    /**
     * @function uploadUserImage
     * @description User Image Save in database
     * @param {image}  req.body
     * @author Devanshu Gautam
     */
    async uploadUserImage(req) {
        try {
            console.log(`req.file`, req.file);
            // const image = `${process.env.BASE_URL_LOCAL}${req.body.typename}/${req.file.filename}`;
            const image = `${process.env.BASE_URL}${req.body.typename}/${req.file.filename}`;
            const payload = await userModel.findOneAndUpdate({ _id: req.user._id }, { image: image }, { new: true });
            console.log(`req.user`, req.user);
            return {
                message: "Your profile has been updated successfully....!",
                status: true,
                data: {
                    image_url: payload.image
                }
            };
        } catch (error) {

        }
    }

    /**
     * @function resendOTP
     * @description OTP not getting then use resand otp to get new otp
     * @param { tempuser,mobile,email,userName} req.body
     * @author Devanshu Gautam
     */
    async resendOTP(req) {
        // let otp = `${Math.floor(1000 + Math.random() * 9000)}`
        if (req.body.tempuser) {
            const tempUser = await this.findTempUser({ _id: req.body.tempuser })
            if (tempUser.length == 0) {
                return {
                    message: "Invaild Id",
                    status: false,
                    data: {}
                }
            }
            const sms = new SMS(tempUser[0].mobile);
            await sms.sendSMS(
                sms.mobile,
                sms.otp,
                // `${tempUser.code} is the OTP for your ${constant.APP_NAME} account. NEVER SHARE YOUR OTP WITH ANYONE. ${constant.APP_NAME} will never call or message to ask for the OTP.`
            );
            return {
                message: "OTP sent on your mobile number...!",
                status: true,
                data: {}
            }
        }
        if (req.body.mobile || Number(req.body.username)) {
            const user = await this.findUser({ mobile: req.body.mobile || req.body.username });
            if (user.length == 0) {
                return {
                    message: "Invaild Id",
                    status: false,
                    data: {}
                }
            }
            const sms = new SMS(user[0].mobile);
            await userModel.updateOne({ _id: user[0]._id }, { code: sms.otp });
            await sms.sendSMS(
                sms.mobile,
                sms.otp,
                // `${sms.otp} is the OTP for your ${constant.APP_NAME} account. NEVER SHARE YOUR OTP WITH ANYONE. ${constant.APP_NAME} will never call or message to ask for the OTP.`
            );
            return {
                message: "OTP sent on your mobile number...!",
                status: true,
                data: {}
            }
        }
        if (req.body.email || !Number(req.body.username)) {
            const user = await this.findUser({ email: req.body.email || req.body.username });
            if (user.length == 0) {
                return {
                    message: "Invaild Email Id",
                    status: false,
                    data: {}
                }
            }
            const mail = new Mail(user[0].email);
            console.log(`mail.otp`, mail.otp);
            await userModel.updateOne({ _id: user[0]._id }, { code: mail.otp });
            await mail.sendMail(
                mail.email,
                `<h3>Resend Otp - ${constant.APP_NAME}</h3><br><p> <b>${mail.otp}</b> is the OTP for your ${constant.APP_NAME} account. <br>NEVER SHARE YOUR OTP WITH ANYONE.<br><br><span style="color:red"> <b>${constant.APP_NAME}</b> will never going to call or message you to ask for the OTP.</span></p>`,
                `Resend Otp`,
            );
            return {
                message: "OTP sent on your Email...!",
                status: true,
                data: {}
            }
        }
    }

    /**
     * @function verifyMobileNumber
     * @description Verification of mobile number  send mobile otp to user
     * @param { mobile }
     * @author Devanshu Gautam
     */
    async verifyMobileNumber(req) {
        const hasuser = await this.findUser({ mobile: req.body.mobile, _id: { $ne: req.user._id } });
        if (hasuser.length > 0) {
            return {
                message: "The mobile number you have entered is already in use.",
                status: false,
                data: {}
            }
        }
        const user = await this.findUser({ _id: req.user._id });
        console.log(`user`, user[0].user_verify.mobile_verify);
        if (user[0].user_verify.mobile_verify == constant.PROFILE_VERIFY_EMAIL_MOBILE.VERIFY) {
            return {
                message: "You have already verified mobile number. You can't change number now.",
                status: false,
                data: {}
            }
        }
        const sms = new SMS(req.body.mobile);
        await userModel.updateOne({ _id: req.user._id }, { code: sms.otp });
        await sms.sendSMS(
            sms.mobile,
            sms.otp,
            // `${sms.otp} is the OTP for your ${constant.APP_NAME} account. NEVER SHARE YOUR OTP WITH ANYONE. ${constant.APP_NAME} will never call or message to ask for the OTP. `
        );
        return {
            message: "OTP sent on your mobile number.",
            status: true,
            data: {}
        }
    }

    /**
     * @function verifyEmail
     * @description Verification of email idsend email otp to user
     * @param { email }
     * @author Devanshu Gautam
     */
    async verifyEmail(req) {
        const hasuser = await this.findUser({ email: req.body.email, _id: { $ne: req.user._id } });
        if (hasuser.length > 0) {
            return {
                message: "The email address you have entered is already in use.",
                status: false,
                data: {}
            }
        }
        const user = await this.findUser({ _id: req.user._id });
        console.log(`user`, user[0].user_verify.mobile_verify);
        if (user[0].user_verify.email_verify == constant.PROFILE_VERIFY_EMAIL_MOBILE.VERIFY) {
            return {
                message: "You have already verified Email Address. You cannot change email address now.",
                status: false,
                data: {}
            }
        }
        const mail = new Mail(req.body.email);
        console.log(`mail.otp`, mail.otp);
        await userModel.updateOne({ _id: req.user._id }, { code: mail.otp });
        await mail.sendMail(
            mail.email,
            `<h3>Verify Email Address - ${constant.APP_NAME}</h3><br><p> <b>${mail.otp}</b> is the OTP for your ${constant.APP_NAME} account. <br>NEVER SHARE YOUR OTP WITH ANYONE.<br><br><span style="color:red"> <b>${constant.APP_NAME}</b> will never going to call or message you to ask for the OTP.</span></p>`,
            `Email Verification Process`,
        );

        return {
            message: "OTP sent on your Email.",
            status: true,
            data: {}
        }
    }

    /**
     * @function verifyCode
     * @description Verification of email and mobile otp to verification and verify the details
     * @param { email,mobile }
     * @author Devanshu Gautam
     */
    async verifyCode(req) {
        const user = await this.findUser({ _id: req.user._id, code: req.body.code });
        if (user.length == 0) {
            return {
                message: 'Invalid Code',
                status: false,
                data: {}
            }
        }
        if (req.body.email) {
            if (user[0].user_verify.email_verify == constant.PROFILE_VERIFY_EMAIL_MOBILE.VERIFY) {
                return {
                    message: 'Your email Address is already Verified',
                    status: false,
                    data: {}
                }
            }
            await userModel.findOneAndUpdate({ _id: req.user._id }, { email: req.body.email });
            const emailBonus = await new GetBouns().getBonus(
                constant.BONUS_TYPES.EMAIL_BONUS,
                user[0].user_verify.emailbonus
            );
            await this.givebonusToUser(
                emailBonus,
                req.user._id,
                constant.PROFILE_VERIFY_BONUS_TYPES.EMAIL_BONUS,
                constant.USER_VERIFY_TYPES.EMAIL_VERIFY
            );
        }
        if (req.body.mobile) {
            if (user[0].user_verify.mobile_verify == constant.PROFILE_VERIFY_EMAIL_MOBILE.VERIFY) {
                return {
                    message: "Your Mobile Number is already verified.",
                    status: false,
                    data: {}
                }
            }
            await userModel.findOneAndUpdate({ _id: req.user._id }, { mobile: req.body.mobile }, { new: true });
            const mobileBonus = await new GetBouns().getBonus(
                constant.BONUS_TYPES.MOBILE_BONUS,
                user[0].user_verify.mobilebonus
            );
            await this.givebonusToUser(
                mobileBonus,
                req.user._id,
                constant.PROFILE_VERIFY_BONUS_TYPES.MOBILE_BONUS,
                constant.USER_VERIFY_TYPES.MOBILE_VERIFY
            );
        }
        return {
            message: 'Verified succcessfully',
            status: true,
            data: {
                userid: req.user._id,
                type: user[0].type && user[0].type != '' ? `${user[0].type} user` : 'normal user',
            }
        }
    }

    /**
     * @function allverify
     * @description Reset the password of user
     * @param { }  
     * user verifyed details
     * @author Devanshu Gautam
     */
    async allverify(req) {
        const payload = await this.findUser({ _id: req.user._id });
        return {
            message: "user verify details",
            status: true,
            data: {
                mobile_verify: payload[0].user_verify.mobile_verify || 0,
                email_verify: payload[0].user_verify.email_verify || 0,
                bank_verify: payload[0].user_verify.bank_verify || 0,
                pan_verify: payload[0].user_verify.pan_verify || 0,
                profile_image_verify: payload[0].user_verify.profile_image_verify || 0,
                image: payload[0].image && payload[0].image != '' ? payload[0].image : `${process.env.BASE_URL}avtar_1.png`,
                email: payload[0].user_verify.email_verify === constant.PROFILE_VERIFY_EMAIL_MOBILE.VERIFY ? payload[0].email : '',
                mobile: payload[0].user_verify.mobile_verify === constant.PROFILE_VERIFY_EMAIL_MOBILE.VERIFY ? payload[0].mobile : '',
                pan_comment: payload[0].user_verify.pan_verify && payload[0].user_verify.pan_verify === constant.PROFILE_VERIFY_PAN_BANK.REJECTED ? payload[0].pancard.comment ? payload[0].pancard.comment : '' : '',
                bank_comment: payload[0].user_verify.bank_verify && payload[0].user_verify.bank_verify === constant.PROFILE_VERIFY_PAN_BANK.REJECTED ? payload[0].bank.comment ? payload[0].bank.comment : '' : ''
            }
        }
    }

    /**
     * @function userFullDtails
     * @description User Full Deatils
     * @param { }
     * @author Devanshu Gautam
     */
    async userFullDetails(req) {
        const userData = await this.findUser({ _id: req.user._id });
        if (userData.length == 0) {
            return {
                message: "User Not Found.",
                status: false,
                data: {}
            }
        }
        let verified = constant.PROFILE_VERIFY.FALSE;
        if (
            userData[0].user_verify.mobile_verify == constant.PROFILE_VERIFY_EMAIL_MOBILE.VERIFY &&
            userData[0].user_verify.email_verify == constant.PROFILE_VERIFY_EMAIL_MOBILE.VERIFY &&
            userData[0].user_verify.pan_verify == constant.PROFILE_VERIFY_PAN_BANK.APPROVE &&
            userData[0].user_verify.bank_verify == constant.PROFILE_VERIFY_PAN_BANK.APPROVE
        ) {
            verified = constant.PROFILE_VERIFY.TRUE;
        }
        return {
            message: "User Full Details..!",
            status: true,
            data: {
                id: userData[0]._id,
                username: userData[0].username,
                mobile: userData[0].mobile,
                email: userData[0].email,
                pincode: userData[0].pincode || '',
                address: userData[0].address || '',
                dob: userData[0].dob ? moment(userData[0].dob).format('DD-MMM-YYYY') : '',
                DayOfBirth: userData[0].dob ? moment(userData[0].dob).format('DD') : '12',
                MonthOfBirth: userData[0].dob ? moment(userData[0].dob).format('MM') : '10',
                YearOfBirth: userData[0].dob ?
                    moment(userData[0].dob).format('YYYY') : '1970',
                gender: userData[0].gender || '',
                image: userData[0].image && userData[0].image != '' ?
                    userData[0].image : `${process.env.BASE_URL}avtar_1.jpg`,
                activation_status: userData[0].status || '',
                state: userData[0].state || '',
                city: userData[0].city || '',
                team: userData[0].team || '',
                teamfreeze: userData[0].team != '' ? constant.FREEZE.TRUE : constant.FREEZE.FALSE,
                refer_code: userData[0].refer_code || '',
                totalbalance: Number(userData[0].userbalance.balance).toFixed(2),
                totalwon: Number(userData[0].userbalance.winning).toFixed(2),
                totalbonus: Number(userData[0].userbalance.bonus).toFixed(2),
                totalticket: Number(userData[0].userbalance.ticket).toFixed(2),
                totalcrown: Number(userData[0].userbalance.crown).toFixed(2),
                totalpasses: Number(userData[0].userbalance.passes).toFixed(2),
                // addcashamount: Number(userData[0].userbalance.balance).toFixed(2),
                // winningamount: Number(userData[0].userbalance.winning).toFixed(2),
                // bonusamount: Number(userData[0].userbalance.bonus).toFixed(2),
                walletamaount: parseFloat(userData[0].userbalance.balance.toFixed(2)) +
                    parseFloat(userData[0].userbalance.winning.toFixed(2)) +
                    parseFloat(userData[0].userbalance.bonus.toFixed(2)),
                verified: verified,
                downloadapk: userData[0].download_apk || constant.DOWNLOAD_APK.FALSE,
                emailfreeze: userData[0].email != '' &&
                    userData[0].user_verify.email_verify == constant.PROFILE_VERIFY_EMAIL_MOBILE.VERIFY ?
                    constant.FREEZE.TRUE : constant.FREEZE.FALSE,
                mobilefreeze: userData[0].mobile != '' &&
                    userData[0].user_verify.mobile_verify == constant.PROFILE_VERIFY_EMAIL_MOBILE.VERIFY ?
                    constant.FREEZE.TRUE : constant.FREEZE.FALSE,
                mobileVerified: userData[0].user_verify.mobile_verify,
                emailVerified: userData[0].user_verify.email_verify,
                PanVerified: userData[0].user_verify.pan_verify,
                BankVerified: userData[0].user_verify.bank_verify,
                statefreeze: userData[0].user_verify.bank_verify == constant.PROFILE_VERIFY_PAN_BANK.APPROVE ?
                    constant.FREEZE.TRUE : constant.FREEZE.FALSE,
                dobfreeze: userData[0].user_verify.pan_verify == constant.PROFILE_VERIFY_PAN_BANK.APPROVE ?
                    constant.FREEZE.TRUE : constant.FREEZE.FALSE,
                totalrefers: userData[0].totalrefercount, //#ReferUserCount of the join application throw referId
                totalwinning: Number(userData[0].totalwinning).toFixed(2), //# FinalResult Table user Total Amount
                totalchallenges: userData[0].totalchallenges, //# All over how many contest it was palyed not was total joining
                totalmatches: userData[0].totalmatches, // # Total Matches it's played(match.matchchallenges.joinleauge or user.totalChallengs)
                totalseries: userData[0].totalseries, //# Total Series it was played(match.matchchallenges.joinleauge in distinct or user.totalChallengs)
            }
        }
    }

    /**
     * @function myTransactions
     * @description User Transaction list
     * @param {  } Auth Key
     * @author Devanshu Gautam
     */
    async myTransactions(req) {
        const myTranction = await TransactionModel.find({ userid: req.user._id }).populate({ path: 'userid' }).sort({ createdAt: -1 });
        if (myTranction.length == 0) {
            return {
                message: 'User Transaction Not Found',
                status: false,
                data: []
            };
        }
        return {
            message: 'User Transaction Details..',
            status: true,
            data: myTranction.map(doc => {
                return {
                    id: doc._id,
                    status: 1,
                    type: doc.type,
                    amount: Number(doc.amount).toFixed(2),
                    team: doc.userid ? doc.userid.team : '',
                    date_time: moment(doc.createdAt).format('DD MMM YYYY HH:mm'),
                    txnid: doc.transaction_id,
                }

            })
        };
    }

    /**
     * @function editProfile
     * @description Edit User Data
     * @param {team } req.body and all of req.body  data save
     * @author Devanshu Gautam
     */
    async editProfile(req) {
        const restrictarray = [
            'madar',
            'bhosadi',
            'bhosd',
            'aand',
            'jhaant',
            'jhant',
            'fuck',
            'chut',
            'chod',
            'gand',
            'gaand',
            'choot',
            'faad',
            'loda',
            'Lauda',
            'maar',
        ];
        if (restrictarray.includes(req.body.team)) {
            return {
                message: 'You cannot use abusive words in your team name..!',
                status: false,
                data: {}
            }
        }
        const user = await userModel.findOne({ team: req.body.team, _id: { $ne: req.user._id } });
        console.log(`user`, user);
        if (user) {
            return {
                message: 'This Team Name Is Already Exist. Please Use some Different Name For Your Team',
                status: false,
                data: {}
            };
        }
        await userModel.findOneAndUpdate({ _id: req.user._id }, req.body);
        return {
            message: 'Profile updated successfully',
            status: true,
            data: { userid: req.user._id }
        }
    }

    /**
     * @function forgotPassword
     * @description Forgot the password for send OTP
     * @param {username} req.body and depend in this mobile and email both comes
     * @author Devanshu Gautam
     */
    async forgotPassword(req) {
        let query = {};
        if (req.body.mobile) {
            query.mobile = req.body.mobile
        }
        if (req.body.email) {
            query.email = req.body.email
        }
        const hasuser = await userModel.findOne(query)
        if (!hasuser) {
            return {
                message: 'You have entered invalid details to reset your password.',
                status: false,
                data: {}
            }
        }
        if (hasuser.status === constant.USER_STATUS.BLOCKED) {
            return {
                message: 'Sorry you cannot reset your password now. Please contact to administrator.',
                status: false,
                data: {}
            };
        }
        if (query.mobile) {
            const sms = new SMS(req.body.mobile);
            await userModel.updateOne({ _id: hasuser._id }, { code: sms.otp });
            await sms.sendSMS(
                sms.mobile,
                sms.otp,
                // `${sms.otp} is the OTP for your ${constant.APP_NAME} account. NEVER SHARE YOUR OTP WITH ANYONE. ${constant.APP_NAME} will never call or message to ask for the OTP.`
            );
            return {
                message: 'OTP sent on your mobile number.',
                status: true,
                data: {}
            };
        }
        if (query.email) {
            const mail = new Mail(req.body.email);
            // console.log(`mail.otp`, mail.otp);
            await userModel.updateOne({ _id: hasuser._id }, { code: mail.otp });
            await mail.sendMail(
                mail.email,
                `<h3>Reset Password - ${constant.APP_NAME}</h3><br><p> <b>${mail.otp}</b> is the OTP for your ${constant.APP_NAME} account. <br>NEVER SHARE YOUR OTP WITH ANYONE.<br><br><span style="color:red"> <b>${constant.APP_NAME}</b> will never call or message to ask for the OTP.</span></p>`,
                `Reset Password Otp`,
            );
            return {
                message: 'We have sent you an OTP on your registered email address. Please check your email and reset your password.',
                status: true,
                data: {},
            };
        }
    }

    /**
     * @function matchCodeForReset
     * @description Forgot the password OTP check and remove from database and give user accses the reset password page
     * @param {username} req.body and depend in this mobile and email both comes
     * @author Devanshu Gautam
     */
    async matchCodeForReset(req) {
        let query = {};
        query.code = req.body.code;
        if (req.body.mobile) {
            query.mobile = req.body.mobile
        }
        if (req.body.email) {
            query.email = req.body.email
        }
        const hasuser = await userModel.findOne(query);
        if (!hasuser) {
            return {
                message: 'Invalid Otp.',
                status: false,
                data: {}
            }
        }
        return {
            message: 'OTP Matched',
            status: true,
            data: { suerid: hasuser._id }
        };
    }

    /**
     * @function resetPassword
     * @description Reset the password of user
     * @param {password,token,code} req.body and depend in this mobile and email both comes
     * @author Devanshu Gautam
     */
    async resetPassword(req) {
        let salt = bcrypt.genSaltSync(10);
        req.body.password = bcrypt.hashSync(req.body.password, salt);
        const hasUser = await userModel.findOneAndUpdate({ _id: req.body.suerid }, { password: req.body.password, code: '' }, { new: true });
        if (!hasUser) {
            return {
                message: 'Invalid Details',
                status: false,
                data: {}
            };
        }
        return {
            message: 'Password Reset Successfully ..!',
            status: true,
            data: { userid: hasUser._id }
        };
    }

    /**
     * @function changePassword
     * @description User Change the password
     * @param { newpassword,confirmpassword,oldpassword } req.body
     * @author Devanshu Gautam
     */
    async changePassword(req) {
        let salt = bcrypt.genSaltSync(10);
        if (req.body.newpassword != req.body.confirmpassword) {
            return {
                message: 'Confirm password and new password are not matched.',
                status: false,
                data: {}
            };
        }
        const user = await userModel.findOne({ _id: req.user._id });
        if (!user) {
            return {
                message: 'Invalid Details.',
                status: false,
                data: {}
            };
        }
        if (!(await bcrypt.compare(req.body.oldpassword, user.password))) {
            return {
                message: 'Old password does not matched to previous password.',
                status: false,
                data: {}
            };
        }
        let password = bcrypt.hashSync(req.body.newpassword, salt);
        const updateUser = await userModel.findOneAndUpdate({ _id: req.user._id }, { password: password }, { new: true });
        return {
            message: 'Password Changed Successfully...!',
            status: true,
            data: { userid: updateUser._id }
        }
    }

    /**
     * @function panRequest
     * @description Pancard detail upload by user
     * @param { pannumber,image,dob,panname }
     * @author Devanshu Gautam
     */
    async panRequest(req) {
        try {
            const user = await userModel.findOne({ 'pancard.pan_number': req.body.pannumber, _id: { $ne: req.user._id } });
            console.log(`user`, user);
            if (user) { return { message: 'This pan card number is already exist.', status: false, data: {} } }
            console.log(`req.file`, req.file);
            let image;
            // const image = `${process.env.BASE_URL_LOCAL}${req.body.typename}/${req.file.filename}`;
            if (req.body.typename) image = `${req.body.typename}/${req.file.filename}`; // typename = pancard
            const update = {};
            update['$set'] = {
                'user_verify.pan_verify': constant.PROFILE_VERIFY_PAN_BANK.SUBMITED,
            };
            update['pancard'] = {
                image: image,
                pan_number: req.body.pannumber.toUpperCase(),
                pan_dob: moment(req.body.dob).format("YYYY-MM-DD"),
                pan_name: req.body.panname.toUpperCase(),
                status: constant.PANCARD.PENDING,
                comment: req.body.comment ? req.body.comment : '',
                created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            };
            await userModel.updateOne({ _id: req.user._id }, update, { new: true });
            return {
                message: 'Your pan card request has been successfully submitted.',
                status: true,
                data: { userid: req.user._id }
            }
        } catch (error) {
            throw error
        }
    }

    /**
     * @function panDetails
     * @description Pancard details get
     * @param {  } Auth Key
     * @author Devanshu Gautam
     */
    async panDetails(req) {
        try {
            let user = await userModel.findOne({ _id: req.user._id }, { pancard: 1 });
            console.log(`user`, user);
            if (!user || !user['pancard'] || !user['pancard'].pan_number || user['pancard'].pan_number == '') {
                return {
                    message: 'Pancard Informtion not submited yet',
                    status: false,
                    data: {}
                }
            }
            return {
                message: '',
                status: true,
                data: {
                    status: true,
                    panname: user['pancard'].pan_name.toUpperCase(),
                    pannumber: user['pancard'].pan_number.toUpperCase(),
                    pandob: moment(user['pancard'].pan_dob).format('DD MMM ,YYYY'),
                    comment: user['pancard'].comment || '',
                    image: user['pancard'].image ? `${process.env.BASE_URL}${user['pancard'].image}` : '' || '',
                    imagetype: user['pancard'].image ? path.extname(user['pancard'].image) == 'pdf' ? 'pdf' : 'image' : '',
                }
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function bankRequest
     * @description bank detail upload by user
     * @param { accountholder,image,accno,ifsc,bankname,bankbranch,state } req.body
     * @author Devanshu Gautam
     */
    async bankRequest(req) {
        try {
            if (!req.body.typename) return {
                message: 'Please update the image properly.',
                status: false,
                data: {}
            }
            if (!req.body.accno) return {
                message: 'Please insert your account number.',
                status: false,
                data: {}
            }
            if (!req.body.ifsc) {
                return {
                    message: 'Please insert your ifsc code',
                    status: false,
                    data: {}
                }
            }
            if (!req.body.accountholder) return {
                message: 'Please insert account holder name',
                status: false,
                data: {}
            }
            if (!req.body.bankname) return {
                message: 'Please insert bank name',
                status: false,
                data: {}
            }
            if (!req.body.bankbranch) return {
                message: 'Please insert bankbranch',
                status: false,
                data: {}
            }
            if (!req.body.state) return {
                message: 'Please insert state',
                status: false,
                data: {}
            }
            const user = await userModel.findOne({ 'bank.accno': req.body.accno });
            if (user) {
                return { message: 'accountholder already exist.', status: false, data: {} }
            }
            let image;
            image = `${req.body.typename}/${req.file.filename}`; // typename = bank
            const update = {};
            console.log("image :::", image)
            update['$set'] = {
                'user_verify.bank_verify': constant.PROFILE_VERIFY_PAN_BANK.SUBMITED,
            };
            update['bank'] = {
                accountholder: req.body.accountholder.toUpperCase(),
                accno: req.body.accno,
                ifsc: req.body.ifsc.toUpperCase(),
                bankname: req.body.bankname,
                bankbranch: req.body.bankbranch,
                state: req.body.state,
                image: image,
                comment: req.body.comment || '',
                status: constant.BANK.PENDING,
                created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            };

            await userModel.updateOne({ _id: req.user._id }, update, { new: true });
            return {
                message: 'Your bank account request has been submitted successfully.',
                status: true,
                data: { userid: req.user._id }
            }

        } catch (error) {
            throw error;
        }
    }

    /**
     * @function bankDetails
     * @description bank details get
     * @param {  } Auth Key
     * @author Devanshu Gautam
     */
    async bankDetails(req) {
        try {
            let user = await userModel.findOne({ _id: req.user._id }, { bank: 1 });
            console.log(`user`, user);
            if (!user || !user['bank'] || !user['bank'].accno || user['bank'].accno == '') {
                return {
                    message: 'Bank Informtion not submited yet',
                    status: false,
                    data: {}
                }
            }
            return {
                message: 'Bank Details',
                status: true,
                data: {
                    status: true,
                    accountholdername: user['bank'].accountholder,
                    accno: user['bank'].accno,
                    ifsc: user['bank'].ifsc.toUpperCase(),
                    bankname: user['bank'].bankname.toUpperCase(),
                    bankbranch: user['bank'].bankbranch.toUpperCase(),
                    state: user['bank'].state.toUpperCase(),
                    comment: user['bank'].comment || '',
                    image: user['bank'].image ? `${process.env.BASE_URL}${user['bank'].image}` : '',
                    imagetype: user['bank'].image ? path.extname(user['bank'].image) == 'pdf' ? 'pdf' : 'image' : ''
                }
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function getBalance
     * @description Balance Detail
     * @param {  } auth key
     * @author Devanshu Gautam
     */
    async getBalance(req) {
        try {
            let hasUser = await userModel.findOne({ _id: req.user._id }, { userbalance: 1 });
            // console.log(`user`, hasUser);
            if (!hasUser) return { message: 'User Not Found', status: false, data: {} };
            const totalAmount = parseFloat(hasUser.userbalance.balance.toFixed(2)) + parseFloat(hasUser.userbalance.winning.toFixed(2)) + parseFloat(hasUser.userbalance.bonus.toFixed(2));
            const usableBalance = parseFloat(hasUser.userbalance.balance.toFixed(2)) + parseFloat(hasUser.userbalance.winning.toFixed(2));
            return {
                message: 'Balance Detail',
                status: true,
                data: {
                    balance: Number(hasUser.userbalance.balance).toFixed(2),
                    winning: Number(hasUser.userbalance.winning).toFixed(2),
                    bonus: Number(hasUser.userbalance.bonus).toFixed(2),
                    totalamount: Number(totalAmount).toFixed(2),
                    totalusableBalance: Number(usableBalance).toFixed(2),
                }
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function myWalletDetails
     * @description Wallet Deatils and verify Details
     * @param {  } auth key
     * @author Devanshu Gautam
     */
    async myWalletDetails(req) {
        try {
            let hasUser = await userModel.findOne({ _id: req.user._id }, { userbalance: 1, user_verify: 1, totalwinning: 1, totalchallenges: 1, totalmatches: 1, totalseries: 1, totalwoncontest: 1 });
            console.log(`user`, hasUser);
            if (!hasUser) return { message: 'User Not Found', status: false, data: {} };
            const totalAmount = parseFloat(hasUser.userbalance.balance.toFixed(2)) + parseFloat(hasUser.userbalance.winning.toFixed(2)) + parseFloat(hasUser.userbalance.bonus.toFixed(2));
            return {
                message: 'User Wallet And Verify Details',
                status: true,
                data: {
                    balance: Number(hasUser.userbalance.balance).toFixed(2),
                    winning: Number(hasUser.userbalance.winning).toFixed(2),
                    bonus: Number(hasUser.userbalance.bonus).toFixed(2),
                    totalamount: Number(totalAmount).toFixed(2),
                    allverify: hasUser.user_verify.mobile_verify == 1 &&
                        hasUser.user_verify.email_verify == 1 &&
                        hasUser.user_verify.pan_verify == 1 &&
                        hasUser.user_verify.bank_verify == 1 ?
                        1 : 0,
                    totalamountwon: hasUser.totalwinning, //# FinalResult Table user Total Amount,
                    totaljoinedcontest: hasUser.totalchallenges, //# All over how many contest it was palyed not was total joining,
                    totaljoinedmatches: hasUser.totalmatches, //# Total Matches it's played(match.matchchallenges.joinleauge or user.totalChallengs),
                    totaljoinedseries: hasUser.totalseries, //# Total Series it was played(match.matchchallenges.joinleauge in distinct or user.totalChallengs),
                    totalwoncontest: hasUser.totalwoncontest, ///# Total Contset Count it was win,
                }
            }

        } catch (error) {
            throw error;
        }
    }

    /**
     * @function requestWithdraw
     * @description Request for Withdraw
     * @param {amount} auth key
     * @author Devanshu Gautam
     */
    async requestWithdraw(req) {
        try {
            if (req.body.amount < constant.WITHDRAW.MINIMUM_WITHDRAW_AMOUNT) {
                return {
                    message: `Withdrawl amount should be greater than or equal to ${constant.WITHDRAW.MINIMUM_WITHDRAW_AMOUNT}`,
                    status: false,
                    data: {}
                }
            }
            let hasUser = await userModel.findOne({ _id: req.user._id }, { withdrawamount: 1, user_verify: 1, userbalance: 1 });
            console.log(`user`, hasUser);
            if (!hasUser) return { message: 'User Not Found', status: false, data: {} };
            if (hasUser.userbalance.winning < req.body.amount) {
                return {
                    message: `You can withdraw only ${hasUser.userbalance.winning} rupees.`,
                    status: false,
                    data: {}
                }
            }
            if (hasUser.user_verify.pan_verify != constant.PROFILE_VERIFY_PAN_BANK.APPROVE) {
                return {
                    message: 'Please first complete your PAN verification process. to withdarw this amount.',
                    status: false,
                    data: {}
                }
            }
            if (hasUser.user_verify.bank_verify != constant.PROFILE_VERIFY_PAN_BANK.APPROVE) {
                return {
                    message: 'Please first complete your Bank verification process to withdraw this amount.',
                    status: false,
                    data: {}
                }
            }
            const date = new Date();
            let aggPipe = [];
            aggPipe.push({
                $match: { userid: mongoose.Types.ObjectId(req.user._id) }
            });
            aggPipe.push({
                $addFields: { created: { $subtract: ['$createdAt', new Date('1970-01-01')] } }
            });
            aggPipe.push({
                $match: { created: { $gte: Number(date.setHours(0, 0, 0, 0)) } }
            });
            aggPipe.push({
                $group: { _id: null, amount: { $sum: '$amount' } }
            });
            aggPipe.push({
                $project: { _id: 0, amount: { $ifNull: ['$amount', 0] }, created: 1 }
            })
            const todayWithdrawAmount = await WithdrawModel.aggregate(aggPipe);
            // let amount = 0;
            // if (todayWithdrawAmount.length == 0) {
            //     todayWithdrawAmount.push({ amount: 0 });
            //     amount = parseFloat(todayWithdrawAmount[0].amount) + Number(req.body.amount);
            // } else {
            let amount = Number(req.body.amount);
            // }
            if (hasUser.withdrawamount < amount) {
                return {
                    message: `You can not withdraw more than ${hasUser.withdrawamount || 10000} in a day.`,
                    status: false,
                    data: {}
                }
            }
            const update = {};
            update['$inc'] = { 'userbalance.winning': -Number(req.body.amount) };
            const userData = await userModel.findOneAndUpdate({ _id: req.user._id }, update, { new: true });
            let save = {},
                transactionSave = {};
            save['userid'] = transactionSave['userid'] = req.user._id;
            save['amount'] = transactionSave['amount'] = transactionSave['withdraw_amt'] = transactionSave[
                'cons_win'
            ] = req.body.amount;
            save['withdraw_req_id'] = transactionSave['transaction_id'] = `WD-${req.user._id}${Date.now()}`;
            save['withdrawfrom'] = req.body.withdrawFrom;
            transactionSave['type'] = constant.BONUS_NAME.withdraw;
            transactionSave['transaction_by'] = constant.TRANSACTION_BY.WALLET;
            transactionSave['paymentstatus'] = constant.PAYMENT_STATUS_TYPES.PENDING;
            transactionSave['bal_fund_amt'] = userData.userbalance.balance.toFixed(2);
            transactionSave['bal_win_amt'] = userData.userbalance.winning.toFixed(2);
            transactionSave['bal_bonus_amt'] = userData.userbalance.bonus.toFixed(2);
            transactionSave['total_available_amt'] = (
                userData.userbalance.balance +
                userData.userbalance.bonus +
                userData.userbalance.winning
            ).toFixed(2);
            transactionSave['challengeid'] = null;
            transactionSave['seriesid'] = null;
            transactionSave['joinid'] = null;
            transactionSave['bonus_amt'] = 0;
            transactionSave['win_amt'] = 0;
            transactionSave['addfund_amt'] = 0;
            transactionSave['cons_amount'] = 0;
            transactionSave['cons_bonus'] = 0;
            transactionSave['challenge_join_amt'] = 0;
            await Promise.all([
                await WithdrawModel.create(save),
                await TransactionModel.create(transactionSave),
            ]);
            return {
                message: `Your request for withdrawl amount of Rs ${req.body.amount} is sent successfully. You will get info about it in between 24 to 48 Hours.`,
                status: true,
                data: {}
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function myWithdrawList
     * @description Get User Withdraw List
     * @param { } auth key
     * @author Devanshu Gautam
     */
    async myWithdrawList(req) {
        try {
            const aggPipe = [];
            aggPipe.push({
                $match: {
                    userid: { $eq: mongoose.Types.ObjectId(req.user._id) }
                }
            });
            aggPipe.push({
                $project: {
                    _id: 1,
                    user_id: 1,
                    // amount: { $round: ['$amount', 2] },
                    amount: 1,
                    withdrawfrom: { $ifNull: ['$withdrawfrom', ''] },
                    withdrawto: '$type',
                    withdrawtxnid: '$withdraw_req_id',
                    withdrawl_date: { $dateToString: { date: '$createdAt', format: '%d-%m-%Y %H:%M:%S' } },
                    approved_date: {
                        $cond: {
                            if: {
                                $eq: ['$approved_date', null],
                            },
                            then: 'Not Available',
                            else: '$approved_date',
                        },
                    },
                    status: {
                        $cond: {
                            if: { $eq: ['$status', 0] },
                            then: constant.WITHDRAW_STATUS.PENDING,
                            else: constant.WITHDRAW_STATUS.APPROVED,
                        },
                    },
                    comment: { $ifNull: ['$comment', 'Not Available'] },
                }
            });
            const withdrawList = await WithdrawModel.aggregate(aggPipe);
            console.log(`withdrawList`, withdrawList);
            if (withdrawList.length == 0) {
                return {
                    message: 'User Withdraw List Is Empty',
                    status: true,
                    data: { withdrawList: [] }
                }
            }
            return {
                message: 'User Withdraw List',
                status: true,
                data: { withdrawList }
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function requestAddCash
     * @description Request Add cash
     * @param {amount,offerid,paymentby }
     * @author Devanshu Gautam
     */
    async requestAddCash(req) {
        try {
            const hasUser = await userModel.findOne({ _id: req.user._id });
            if (!hasUser) return { message: 'Failed', status: false, data: { txnid: 0 } };
            let offerId = '';
            const amount = Number(req.body.amount);
            if (req.body.offerid || req.body.offerid != '') {
                const offerData = await OfferModel.findOne({ offercode: req.body.offerid });
                if (offerData && offerData.maxamount >= amount && offerData.minamount <= amount)
                // if (offerData && offerData.maxamount == amount)
                    offerId = req.body.offerid;
            }
            const orderid = `${constant.APP_SHORT_NAME}-add-${Date.now()}${hasUser._id}`;
            await PaymentProcessModel.create({
                amount: amount,
                userid: hasUser._id,
                paymentmethod: req.body.paymentby,
                orderid: orderid,
                offerid: offerId,
            });
            return {
                message: 'Order Id Generated',
                status: true,
                data: { txnid: orderid, amount },
            };
        } catch (error) {
            throw error;
        }
    }

    async requestprocess(paymentgatewayinfo) {
        try {
            let pipeline = [];
            pipeline.push({
                $match: { $and: [{ status: constant.PAYMENT_STATUS_TYPES.PENDING }, { $or: [{ orderid: paymentgatewayinfo.txnid }, { returnid: paymentgatewayinfo.returnid }, { orderid: paymentgatewayinfo.returnid }, { returnid: paymentgatewayinfo.txnid }] }] }
            });
            pipeline.push({
                $lookup: {
                    from: 'paymentprocesses',
                    localField: 'userid',
                    foreignField: '_id',
                    as: 'userdata'
                }
            });
            pipeline.push({
                $unwind: {
                    path: "$userdata",
                }
            });
            pipeline.push({
                $project: {
                    _id: 1,
                    userid: 1,
                    amount: 1,
                    offerid: 1,
                    paymentmethod: 1,
                    status: 1,
                    orderid: 1,
                    returnid: 1,
                    username: '$userdata.username',
                    userbalance: '$userdata.userbalance',
                    balance: '$userdata.userbalance.balance',
                    winning: '$userdata.userbalance.winning',
                    bonus: '$userdata.userbalance.bonus',
                    email: '$userdata.email',
                    mobile: '$userdata.mobile',
                    mobileVerify: '$userdata.user_verify.mobile_verify',
                    emailVerify: '$userdata.user_verify.email_verify',
                }
            });
            let findUserInfo = await PaymentProcessModel.aggregate(pipeline);
            if (!findUserInfo) {
                return {
                    message: 'no user data found',
                    status: false,
                }
            }
            let fetchInfo = {};
            let obj = {};
            fetchInfo.amount = finduserinfo.amount;
            fetchInfo.userid = finduserinfo.userid;
            fetchInfo.paymentby = finduserinfo.paymentmethod;
            fetchInfo.returnid = finduserinfo.returnid;
            obj.returnid = paymentgatewayinfo.txnid;
            obj.status = !paymentgatewayinfo.status ? 'success' : paymentgatewayinfo.status;

            const updatePaymentProcess = await PaymentProcessModel.findOneAndUpdate({ _id: findUserInfo._id }, { $set: { returnid: obj.returnid, status: obj.status } }, { new: true });
            if (findUserInfo.userbalance) {
                let newAmount = findUserInfo.balance + paymentgatewayinfo.amount;
                const updateUserBalance = await useModel.findOneAndUpdate({ _id: fetchInfo.userid }, {
                    $set: { 'userbalance.balance': newAmount }
                });

                if (findUserInfo.offerid) {
                    let findOffer = await offerModel.findOne({ userid: findUserInfo.userid });
                    let amountt;
                    if (findOffer.bonus_type == 'per') {
                        amountt = finduserinfo.amount * (findOffer.bonus / 100);
                    } else {
                        amountt = findOffer.bonus;
                    }

                    if (offer.prize_type == 'realcash') {
                        let insertbalance = findUserInfo.balance + amountt;
                        const updateUser = await useModel.findOneAndUpdate({ _id: fetchInfo.userid }, { $set: { 'userbalance.balance': insertbalance } });
                    } else {
                        let insertbonus = findUserInfo.bonus + amountt;
                        const updateUser = await useModel.findOneAndUpdate({ _id: fetchInfo.userid }, { $set: { 'userbalance.bonus': insertbonus } });
                    }

                    let userOfferObj = {},
                        transactionObj = {},
                        notificationObj = {};
                    let bal_bonus_amt = findUserInfo.bonus;
                    let bal_win_amt = findUserInfo.winning;
                    let bal_fund_amt = findUserInfo.balance;
                    let total_available_amt = findUserInfo.balance + findUserInfo.bonus + findUserInfo.winning;
                    transactionObj.transaction_id = `${constant.APP_SHORT_NAME}-EBONUS-${Date.now()}`;
                    transactionObj.transaction_by = constant.TRANSACTION_BY.APP_NAME;
                    transactionObj.userid = findUserInfo.userid;
                    transactionObj.type = 'special bonus';
                    transactionObj.amount = amountt;
                    if (offer.prize_type == 'realcash') {
                        transactionObj.addfund_amt = amountt;
                    } else {
                        transactionObj.bonus_amt = amountt;
                    }
                    transactionObj.paymentstatus = 'confirmed';
                    transactionObj.bal_fund_amt = bal_fund_amt;
                    transactionObj.bal_win_amt = bal_win_amt;
                    transactionObj.bal_bonus_amt = bal_bonus_amt;
                    transactionObj.total_available_amt = total_available_amt;
                    userOfferObj.user_id = findUserInfo.userid;
                    userOfferObj.offer_id = findOffer._id;
                    const insertTransaction = await TransactionModel.create(transactionObj);
                    const insertUsedOffer = await usedOfferModel.create(userOfferObj);
                    notificationObj.title = `'You have got ₹'${amountt}' special bonus on ' ${constant.APP_SHORT_NAME}' app.'`;
                    notificationObj.userid = findUserInfo.userid;
                    const insertNotification = await NotificationModel.create(notificationObj);
                }
            }

            /* entry in transactions*/
            let trdata = {};
            trdata.type = 'Cash added';
            trdata.transaction_id = `${constant.APP_SHORT_NAME}-ADD-${Date.now()}`;
            trdata.userid = finduserinfo.userid;
            trdata.amount = finduserinfo.amount;
            trdata.addfund_amt = finduserinfo.amount;
            trdata.transaction_by = paymentgatewayinfo.paymentby;
            const insertTransaction = await TransactionModel.create(trdata);
            return {
                status: true,

            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function webhookDetail
     * @description cashfree Webhook response
     * @param {orderId,orderAmount,referenceId,txStatus,paymentMode,txMsg,txTime,signature}
     * @author Devanshu Gautam
     */
    async webhookDetail(req) {
        try {
            /*{
    "data": {
        "cf_link_id": 1576977,
        "link_id": "payment_ps11",
        "link_status": "PARTIALLY_PAID",
        "link_currency": "INR",
        "link_amount": "200.12",
        "link_amount_paid": "55.00",
        "link_partial_payments": true,
        "link_minimum_partial_amount": "11.00",
        "link_purpose": "Payment for order 10",
        "link_created_at": "2021-08-18T07:13:41",
        "customer_details": {
            "customer_phone": "9000000000",
            "customer_email": "john@gmail.com",
            "customer_name": "John "
        },
        "link_meta": {
            "notify_url": "https://ee08e626ecd88c61c85f5c69c0418cb5.m.pipedream.net"
        },
        "link_url": "https://payments-test.cashfree.com/links//U1mgll3c0e9g",
        "link_expiry_time": "2021-11-28T21:46:20",
        "link_notes": {
            "note_key_1": "note_value_1"
        },
        "link_auto_reminders": true,
        "link_notify": {
            "send_sms": true,
            "send_email": true
        },
        "order": {
            "order_amount": "22.00",
            "order_id": "CFPay_U1mgll3c0e9g_ehdcjjbtckf",
            "order_expiry_time": "2021-08-18T07:34:50",
            "order_hash": "Gb2gC7z0tILhGbZUIeds",
            "transaction_id": 1021206,
            "transaction_status": "SUCCESS"
        }
    },
    "type": "PAYMENT_LINK_EVENT",
    "version": "1",
    "event_time": "2021-08-18T12:55:06+05:30"
}
*/
            if (!req.body.orderId)
                return {
                    message: 'Please insert orderId',
                    status: false,
                    data: {}
                }

            if (!req.body.amount)
                return {
                    message: 'Please insert Amount',
                    status: false,
                    data: {}
                }

            if (!req.body.paymentMode)
                return {
                    message: 'Please Choose Payment Mode',
                    status: false,
                    data: {}
                }

            if (!req.body.referenceId)
                return {
                    message: 'Please insert Reference ID',
                    status: false,
                    data: {}
                }

            if (!req.body.signature)
                return {
                    message: 'Signature not uploaded',
                    status: false,
                    data: {}
                }

            if (!req.body.txTime)
                return {
                    message: 'Please insert Time',
                    status: false,
                    data: {}
                }

            if (!req.body.txMsg)
                return {
                    message: 'Please insert message',
                    status: false,
                    data: {}
                }

            let orderId = req.body.orderId;
            let amount = req.body.orderAmount; // we need these
            let returnid = req.body.referenceId; // we need these
            let status = 'pending'; // we need these
            let paymentby = req.body.paymentMode; // we need these
            let txMsg = req.body.txMsg;
            let txTime = req.body.txTime;
            let signature = req.body.signature;
            let data = `${orderId}${amount}${returnid}${status}${paymentby}${txMsg}${txTime}`;
            const computedSignature = Base64.stringify(hmacSHA256(data, process.env.CASHFREE_SECRETKEY)); //process.env.CASHFREE_SECRETKEY
            let getdata = {};
            let paymentdata = {};
            let paymentgatewayinfo = {};
            if (signature != computedSignature) {
                return {
                    status: false,
                    message: 'Signature not matched',
                    data: {}
                }
            }
            const findOrderId = await PaymentProcessModel.findOne({ orderid: orderId });
            if (!findOrderId) {
                return {
                    message: 'order ID not found',
                    status: false,
                    data: {},
                }
            }
            let uid = findOrderId.userid;
            let paymentstatus = findOrderId.status;
            if (paymentstatus == "pending") {

                getdata.amount = Number(amount);
                getdata.userid = uid;
                getdata.returnid = returnid;
                let userData = await userModel.findOne({ _id: uid });
                if (!userData) {
                    return {
                        message: 'user not found',
                        status: false,
                        data: {},
                    }
                }
                paymentdata.amount = amount;
                paymentdata.userid = userData._id;
                paymentdata.username = userData.username;
                paymentdata.mobile = userData.mobile;
                paymentdata.email = userData.email;
                paymentdata.paymentby = paymentby;

                paymentgatewayinfo.amount = getdata.amount;
                paymentgatewayinfo.txnid = orderid;
                paymentgatewayinfo.paymentby = paymentby;
                paymentgatewayinfo.returnid = returnid;
                paymentgatewayinfo.status = status;
                let returnamount = this.requestprocess(paymentgatewayinfo);

                if (returnamount.status == true) {
                    let newTransactionObj = {};
                    if (findOrderId.refer_id) {
                        let totaladded = await PaymentProcessModel.findOne({ status: "success", userid: uid }, { amount: 1 });
                        let newAmount = 0;
                        if (totaladded) {
                            newAmount = getdata.amount + totaladded.amount;
                        } else {
                            newAmount = getdata.amount;
                        }
                    }
                    if (newAmount >= 100) {
                        if (findOrderId.user_verify.referbonus == 0) {
                            let reffering = findOrderId.refer_id;
                            amount = 50;
                            let findUserRefferal = await userModel.findOne({ _id: reffering });
                            let updateBonus = findUserRefferal.userbalance.bonus + 50;
                            let updateUserBalance = await userModel.userModeq.findOneAndUpdate({ _id: reffering }, { $Set: { 'userbalance.bonus': updateBonus, 'user_verify.referbonus': 1 } }, { new: true });
                            let total_available_amt = findUserRefferal.userbalance.balance + findUserRefferal.userbalance.bonus + findUserRefferal.userbalance.winning;

                            newTransactionObj.userid = reffering;
                            newTransactionObj.type = 'Refer Bonus';
                            newTransactionObj.transaction_id = `${constant.APP_SHORT_NAME}-NWP-${Date.now()}`;
                            newTransactionObj.transaction_by = 'NWP';
                            newTransactionObj.amount = amount;
                            newTransactionObj.paymentstatus = 'confirm';
                            newTransactionObj.bal_fund_amt = findUserRefferal.userbalance.balance;
                            newTransactionObj.bal_win_amt = findUserRefferal.userbalance.bonus;
                            newTransactionObj.bal_bonus_amt = findUserRefferal.userbalance.winning;
                            newTransactionObj.total_available_amt = total_available_amt;
                            const insertTransactionData = await TransactionModel.create(newTransactionObj);
                        }
                    }
                }
                let notificationObj2 = {};
                notificationObj2.userid = uid;
                notificationObj2.seen = 0;
                let titleget = "payment done";
                let msg = notificationObj2.title = `You have added rupees ${getdata.amount}' by ${paymentby}`;
                const insertNotificationdata = await TransactionModel.create(notificationObj2);
                //    $result=Helpers::sendnotification($titleget,$msg,'',$uid );
                return {
                    status: true,
                    message: 'payment done'
                }
            } else {
                return {
                    status: false,
                    message: 'payment failed'
                }
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function paymentStatus
     * @description cashfree api to check payment status
     * @param {orderId,orderAmount,referenceId,txStatus,paymentMode,txMsg,txTime,signature }
     * @author Devanshu Gautam
     */
    // async paymentStatus(req) {
    //     try {
    //         const dataKey = `${req.body.orderId}${req.body.orderAmount}${req.body.referenceId}${req.body.txStatus}${req.body.paymentMode}${req.body.txMsg}${req.body.txTime}`;
    //         const computedSignature = Base64.stringify(hmacSHA256(dataKey, process.env.CASHFREE_SECRETKEY));
    //         if (computedSignature == req.body.signature) {
    //             const returnData = await requestProcess({
    //                 amount: req.body.orderAmount,
    //                 txnid: req.body.orderId,
    //                 paymentby: req.body.paymentMode,
    //                 returnid: req.body.signature,
    //             });
    //             if (returnData.success == true) {
    //                 const notificationObject = {
    //                     receiverId: returnData.userId,
    //                     deviceTokens: returnData.app_key,
    //                     type: NOTIFICATION_TEXT.ADD_AMOUNT,
    //                     title: NOTIFICATION_TEXT.ADD_AMOUNT.TITLE,
    //                     message: NOTIFICATION_TEXT.ADD_AMOUNT.BODY(
    //                         req.body.orderAmount,
    //                         CONSTANTS.PAYMENT_METHOD.CASHFREE
    //                     ),
    //                     entityId: returnData.userId,
    //                 };
    //                 await NotificationModel.create({
    //                     title: notificationObject.message,
    //                     userid: returnData.userId,
    //                 });
    //                 await PushNotifications(notificationObject);
    //                 return { msg: 'Payment Done' };
    //             }
    //             return { msg: 'Payment Failed' };
    //         }
    //         return { msg: 'Payment Failed' };
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    /**
     * @function socialAuthentication
     * @description Google and Facebook Social Login
     * @param { name,email,image,appid } req.body
     * @author Devanshu Gautam
     */
    async socialAuthentication(req) {
        try {
            const userData = await this.findUser({ email: req.body.email });
            if (userData.length != 0) {
                if (userData[0].status != constant.USER_STATUS.ACTIVATED) {
                    return {
                        message: 'You cannot login now in this account. Please contact to administartor.',
                        status: false,
                        data: { userid: '' },
                    };
                }
                const token = jwt.sign({ _id: userData[0]._id.toString(), refer_code: userData[0].refer_code }, process.env.SECRET_TOKEN);
                await userModel.updateOne({ _id: userData[0]._id }, { app_key: req.body.appid || '' });
                return {
                    message: 'Login Successfully.',
                    status: true,
                    data: {
                        token,
                        mobile_status: userData[0].user_verify.mobile_verify == 1 ?
                            constant.PROFILE_VERIFY_EMAIL_MOBILE.VERIFY : constant.PROFILE_VERIFY_EMAIL_MOBILE.PENDING,
                        type: userData[0].type ? `${userData[0].type} user` : 'normal user',
                        userid: userData[0]._id,
                    }
                }
            } else {
                const refer_code = await this.genrateReferCode(req.body.email);
                const save = {};
                save['email'] = req.body.email;
                save['refer_code'] = refer_code;
                save['username'] = req.body.name;
                save['status'] = 'activated';
                save['image'] = req.body.image;
                save['user_verify'] = { email_verify: 0, emailbonus: 0 };
                save['userbalance'] = { bonus: 0 };

                const user = await userModel.create(save);
                const token = jwt.sign({ _id: user._id.toString(), refer_code: user.refer_code }, process.env.SECRET_TOKEN);
                const hasUser = await userModel.findOneAndUpdate({ _id: user._id }, { app_key: req.body.appid }, { new: true });
                const emailBonus = await new GetBouns().getBonus(
                    constant.BONUS_TYPES.EMAIL_BONUS,
                    constant.PROFILE_VERIFY_BONUS_TYPES_VALUES.FALSE,
                    // hasUser.user_verify.emailbonus
                );
                await this.givebonusToUser(
                    emailBonus,
                    user._id,
                    constant.PROFILE_VERIFY_BONUS_TYPES.EMAIL_BONUS,
                    constant.USER_VERIFY_TYPES.EMAIL_VERIFY
                );
                return {
                    message: 'Login Successfully.',
                    status: true,
                    data: {
                        token,
                        mobile_status: hasUser.user_verify.mobile_verify == 1 ?
                            constant.PROFILE_VERIFY_EMAIL_MOBILE.VERIFY : constant.PROFILE_VERIFY_EMAIL_MOBILE.PENDING,
                        type: user.type ? `${hasUser.type} user` : 'normal user',
                        userid: user._id,
                    }
                }
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function getNotification
     * @description Get Notification of user for prious and tody two different array
     * @param {}  auth key
     * @author Devanshu Gautam
     */
    async getNotification(req) {
        try {
            let notificationdata = await NotificationModel.find({ userid: req.user._id }).sort({ createdAt: -1 });
            await NotificationModel.updateMany({ userid: req.user._id, seen: 0 }, { seen: 1 });
            if (notificationdata.length == 0) {
                return {
                    message: "Notification of user for previous and today Not Found...",
                    status: false,
                    data: []
                }
            }
            return {
                message: "Get Notification of user for previous and today",
                status: true,
                data: notificationdata
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * @Route offerdepositsnew
     * @function getOffers
     * @description All Offers Details
     * @param {  } auth key
     * @author Devanshu Gautam
     */
    async getOffers(req) {
        try {
            const aggPipe = [];
            aggPipe.push({
                $match: {
                    start_date: { $lte: moment().format('YYYY-MM-DD HH:mm:ss') },
                    expire_date: { $gte: moment().format('YYYY-MM-DD') },
                },
            });
            aggPipe.push({
                $lookup: {
                    from: 'usedoffers',
                    let: { offer_id: '$_id' },
                    pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$$offer_id', '$offer_id'] },
                                        { $eq: ['$user_id', mongoose.Types.ObjectId(req.user._id)] },
                                    ],
                                },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                used: { $sum: 1 },
                            },
                        },
                    ],
                    as: 'usedoffer',
                },
            });
            aggPipe.push({
                $project: {
                    _id: 0,
                    offerid: '$_id',
                    title: 1,
                    minamount: { $ifNull: ['$minamount', 0] },
                    amount: '$maxamount',
                    offercode: 1,
                    bonus: 1,
                    bonus_type: 1,
                    start_date: 1,
                    expire_date: 1,
                    used_time: 1,
                    description: 1,
                },
            });
            const offers = await OfferModel.aggregate(aggPipe);
            if (!offers) return {
                message: 'Offer Not Found',
                status: false,
                data: []
            };
            return {
                message: 'Offer Data...',
                status: true,
                data: offers
            }
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new userServices();