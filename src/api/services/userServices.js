const mongoose = require("mongoose");
const randomstring = require("randomstring");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const path = require("path");
const hmacSHA256 = require("crypto-js/hmac-sha256");
const Base64 = require("crypto-js/hmac-sha256");
const CryptoJS = require("crypto-js");

const userModel = require("../../models/userModel");
const tempuserModel = require("../../models/tempUserModel");
const TransactionModel = require("../../models/transactionModel");
const NotificationModel = require("../../models/notificationModel");
// const AdminModel = require("../../models/adminModel");
// const WithdrawModel = require("../../models/withdrawModel");
// const PaymentProcessModel = require("../../models/PaymentProcessModel");
// const withdrawWebhookModel = require("../../models/withdrawWebhookModel");
// const OfferModel = require("../../models/offerModel");
// const usedOfferModel = require("../../models/usedOfferModel");
// const ticketOrderModel = require("../../models/ticketOrderModel");

const constant = require("../../config/const_credential");
const NOTIFICATION_TEXT = require("../../config/notification_text");
const notification = require("../../utils/notifications");
const appUtils = require("../../utils/appUtils");
const SMS = require("../../utils/sms");
const Mail = require("../../utils/mail");
const GetBouns = require("../../utils/getBonus");
const { constants } = require("buffer");
const Cashfree = require("cashfree-sdk");

class UserServices {
    constructor() {
        return {
            addTempuser: this.addTempuser.bind(this),
            registerUser: this.registerUser.bind(this),
            loginuser: this.loginuser.bind(this),
            loginuserOTP: this.loginuserOTP.bind(this),
            logoutUser: this.logoutUser.bind(this),
            viewtransactions: this.viewtransactions.bind(this),
            blockUser: this.blockUser.bind(this),
            unBlockUser: this.unBlockUser.bind(this),
            editUserDetails_page: this.editUserDetails_page.bind(this),
            edituserdetails: this.edituserdetails.bind(this),
            adminwallet: this.adminwallet.bind(this),
            getUserDetails: this.getUserDetails.bind(this),
            addmoneyinwallet: this.addmoneyinwallet.bind(this),
            downloadalluserdetails: this.downloadalluserdetails.bind(this),
            changeYotuberStatus:this.changeYotuberStatus.bind(this),
            userFullDetails:this.userFullDetails.bind(this),
        }
    }
    async findUser(data) {
        let result = await userModel.find(data);
        console.log("result...............",result)
        return result;
      }

    /**
   * @function genrateReferCode
   * @description using this function to generate refercode for user
   * @param {mobile}
   * @author Devanshu Gautam
   */
    async genrateReferCode(mobile) {
        const char = String(mobile).substring(0, 4);
        const coupon = randomstring.generate({
            charset: "alphanumeric",
            length: 4,
        });
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
                    email: req.body.email,
                };
                obj.email = req.body.email;
                let data = await this.findUser(whereObj);
                if (data.length > 0) {
                    return {
                        message: "The email address you have entered is already in use.",
                        status: false,
                        data: { email: data[0].email },
                    };
                }
            }
            if (req.body.mobile) {
                let whereObj = {
                    mobile: req.body.mobile,
                };
                obj.mobile = req.body.mobile;
                let data = await this.findUser(whereObj);
                if (data.length > 0) {
                    return {
                        message: "The mobile number you have entered is already in use.",
                        status: false,
                        data: { mobile: data[0].mobile },
                    };
                }
            }
            let salt = bcrypt.genSaltSync(10);
            req.body.password = bcrypt.hashSync(req.body.password, salt);
            let userREf = await userModel.findOne({ refer_code: req.body.refercode });
            const referId =
                req.body.refercode && req.body.refercode != ""
                    ? userREf
                        ? userREf.refer_code
                        : null
                    : null;
            const sms = new SMS(req.body.mobile);
            await sms.sendSMS(
                sms.mobile,
                sms.otp
                // `${sms.otp} is the OTP for your ${constant.APP_NAME} account. NEVER SHARE YOUR OTP WITH ANYONE. ${constant.APP_NAME} will never call or message to ask for the OTP.`
            );
            let tempuser = await this.findTempUser(obj);
            if (tempuser.length > 0) {
                let userFound = await tempuserModel.findOneAndUpdate(
                    {
                        $or: [
                            { email: req.body.email || "" },
                            { mobile: req.body.mobile || "" },
                        ],
                    },
                    {
                        email: req.body.email,
                        mobile: req.body.mobile,
                        password: req.body.password,
                        username: req.body.fullname || "",
                        refer_id: referId,
                        code: sms.otp || "1234",
                    },
                    {
                        new: true,
                        upsert: true,
                    }
                );
                if (userFound) {
                    return {
                        message: "OTP is Sent to youe mobile number",
                        status: true,
                        data: { tempUser: userFound._id },
                    };
                }
            } else {
                let addTempuserData = new tempuserModel({
                    email: req.body.email,
                    mobile: req.body.mobile,
                    password: req.body.password,
                    username: req.body.fullname || "",
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
            };
            const findTempUser = await this.findTempUser(TempUserWhereObj);
            if (findTempUser.length == 0)
                return { message: "Invalid OTP", status: false, data: {} };
            // console.log(`findTempUser[0]`, findTempUser[0]);
            let mobileBonus = await new GetBouns().getBonus(
                constant.BONUS_TYPES.MOBILE_BONUS,
                constant.PROFILE_VERIFY_BONUS_TYPES_VALUES.FALSE
            );
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
                app_key: req.body.appid || "",
            });
            let user = await adduserData.save();
            if (findTempUser[0].refer_id != null && findTempUser[0].refer_id) {
                await userModel.updateOne(
                    { _id: findTempUser[0].refer_id },
                    { $inc: { totalrefercount: 1 } }
                );
            }
            const token = jwt.sign(
                { _id: user._id.toString() },
                constant.SECRET_TOKEN
            );
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
                    title: NOTIFICATION_TEXT.BONUS.BODY(
                        mobileBonus,
                        constant.BONUS_NAME.mobilebonus
                    ),
                    userid: user._id,
                }),
                userModel.updateOne(
                    {
                        _id: mongoose.Types.ObjectId(user._id),
                    },
                    { auth_key: token }
                ),
            ]);

            return {
                message: "Registration Done....",
                status: true,
                data: { auth_key: "", userid: "", token },
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
        update["$inc"] = { "userbalance.bonus": data.bonusamount };
        update["code"] = "";
        if (data.verifyType != "") update[`user_verify.${data.verifyType}`] = 1;
        if (data.type != constant.PROFILE_VERIFY_BONUS_TYPES.REFER_BONUS)
            update[`user_verify.${data.type}`] = 1;
        return await userModel.findOneAndUpdate({ _id: data.userId }, update, {
            new: true,
        });
    }

    /**
     * @function givebonusToUser
     * @description Give bonus to user verification and refering
     * @param { bonusamount,userId,type,verifyType}
     * @author Devanshu Gautam
     */
    async givebonusToUser(
        bonusamount = 0,
        userId,
        type,
        verifyType = "",
        referUser = null
    ) {
        // console.log(bonusamount, '------------', userId, '-----------------', type, '----------', verifyType);
        const transaction_id = `${constant.APP_SHORT_NAME}-EBONUS-${Date.now()}`;
        const balanceUpdate = await this.updateUserBalanceAndUserVerify({
            bonusamount,
            type,
            verifyType,
            userId,
        });
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
            total_available_amt:
                balanceUpdate.userbalance.balance ||
                0 + balanceUpdate.userbalance.winning ||
                0 + balanceUpdate.userbalance.bonus ||
                0,
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
            await userModel.findOneAndUpdate({ _id: userId }, dataToSave, {
                new: true,
            });
        }

        const notificationObject = {
            receiverId: userId,
            deviceTokens: balanceUpdate.app_key,
            type: NOTIFICATION_TEXT.BONUS,
            title: NOTIFICATION_TEXT.BONUS.TITLE(constant.BONUS_NAME[type]),
            message: NOTIFICATION_TEXT.BONUS.BODY(
                bonusamount,
                constant.BONUS_NAME[type]
            ),
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
                mobile: req.body.mobile,
            };
            const user = await this.findUser(obj);
            if (user.length == 0) {
                return {
                    message: "This mobile number is not registered.",
                    status: false,
                    data: { auth_key: 0, userid: 0 },
                };
            }
            if (user[0].status.toLowerCase() == "blocked") {
                return {
                    message:
                        "You cannot login now in this account. Please contact to administartor.",
                    status: false,
                    data: { auth_key: 0, userid: 0 },
                };
            }
            const sms = new SMS(req.body.mobile);
            const otpsent = await sms.sendSMS(
                sms.mobile,
                sms.otp
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
                email: req.body.email,
            };
            const user = await this.findUser(obj);
            if (user.length == 0) {
                return {
                    message: "Invalid username or Password.",
                    status: false,
                    data: { auth_key: 0, userid: 0 },
                };
            }
            if (user[0].status.toLowerCase() == "blocked") {
                return {
                    message:
                        "You cannot login now in this account. Please contact to administartor.",
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
            const token = jwt.sign(
                { _id: user[0]._id.toString(), refer_code: user[0].refer_code },
                constant.SECRET_TOKEN
            );
            console.log('app_key email login -->', req.body.appid)
            await userModel.updateOne(
                { _id: user[0]._id },
                { auth_key: token, app_key: req.body.appid || "" },
                { new: true }
            );
            return {
                message: "Login Successfully.",
                status: true,
                data: {
                    token,
                    auth_key: token,
                    userid: user[0]._id,
                    type: user[0].type
                        ? `${user[0].type} ${constant.USER_TYPE.USER}`
                        : constant.USER_TYPE.NORMAL_USER,
                },
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
                message: "user not found ...!",
                status: false,
                data: {},
            };
        }
        await userModel.updateOne(
            { _id: user._id },
            { app_key: "" },
            { new: true }
        );
        return {
            message: "Logout successfully..",
            status: true,
            data: {},
        };
    }
    /**
     * @function loginuserOTP
     * @description Login User By mobile and otp
     * @param { mobile,otp,appid } req.body
     * @author Devanshu Gautam
     */
    async loginuserOTP(req) {
        const user = await this.findUser({
            mobile: req.body.mobile,
            code: req.body.otp,
        });
        if (user.length == 0) {
            return {
                message: "Invalid OTP.",
                status: false,
                data: { auth_key: 0, userid: 0 },
            };
        }
        if (user[0].status.toLowerCase() == "blocked") {
            return {
                message:
                    "You cannot login now in this account. Please contact to administartor.",
                status: false,
                data: { auth_key: 0, userid: 0 },
            };
        }
        const token = jwt.sign(
            { _id: user[0]._id.toString(), refer_code: user[0].refer_code },
            constant.SECRET_TOKEN
        );
        console.log('app_key mobile login -->', req.body.appid)
        await userModel.updateOne(
            { _id: user[0]._id },
            { auth_key: token, app_key: req.body.appid || "" },
            { new: true }
        );
        return {
            message: "Login Successfully.",
            status: true,
            data: {
                token,
                auth_key: token,
                userid: user[0]._id,
                type: user[0].type
                    ? `${user[0].type} ${constant.USER_TYPE.USER}`
                    : constant.USER_TYPE.NORMAL_USER,
            },
        };
    }

    async viewtransactions(req) {
        try {
            const findTransactions = await transactionModel.findOne({ userid: req.params.id });
            if (findTransactions) {
                return {
                    status: true,
                    data: findTransactions,
                }
            }
        } catch (error) {
            throw error;
        }
    }

    async editUserDetails_page(req) {
        try {
            const findData = await userModel.findOne({ _id: req.params.id });
            if (!findData) {
                return {
                    status: false,
                }
            } else {
                return {
                    status: true,
                    data: findData,
                }
            }
        } catch (error) {
            throw error;
        }

    }

    async edituserdetails(req) {
        try {
            if (req.fileValidationError) {
                return {
                    status: false,
                    message: req.fileValidationError
                }

            } else {
                let dataObj = req.body;
                const data = await userModel.find({ _id: dataObj.Uid });
                const checkTeam = await userModel.find({ _id: { $ne: dataObj.Uid }, team: req.body.team });
                if (checkTeam.length > 0) {
                    let filePath = `public/${req.body.typename}/${req.file.filename}`;
                    if (fs.existsSync(filePath) == true) {
                        fs.unlinkSync(filePath);
                    }
                    return {
                        status: false,
                        message: `team name already exists..`
                    }
                } else {

                    const checkEmail = await userModel.find({ _id: { $ne: dataObj.Uid }, email: req.body.email });
                    if (checkEmail.length > 0) {
                        let filePath = `public/${req.body.typename}/${req.file.filename}`;
                        if (fs.existsSync(filePath) == true) {
                            fs.unlinkSync(filePath);
                        }
                        return {
                            status: false,
                            message: 'Email id already register..'
                        }
                    } else {
                        const checkMobile = await userModel.find({ _id: { $ne: dataObj.Uid }, mobile: req.body.mobile });
                        if (checkMobile.length > 0) {
                            let filePath = `public/${req.body.typename}/${req.file.filename}`;
                            if (fs.existsSync(filePath) == true) {
                                fs.unlinkSync(filePath);
                            }
                            return {
                                status: false,
                                message: 'mobile number already register..'
                            }
                        } else {

                            if (req.file) {
                                if (data[0].image) {
                                    let filePath = `public${data[0].image}`;
                                    if (fs.existsSync(filePath) == true) {
                                        fs.unlinkSync(filePath);
                                    }
                                }
                                dataObj.image = `/${req.body.typename}/${req.file.filename}`;

                            }
                            let updatedUser = await userModel.updateOne({ _id: dataObj.Uid }, { $set: dataObj });
                            if (updatedUser.modifiedCount > 0) {
                                return {
                                    status: true,
                                    message: 'successfully update details'
                                }
                            } else {
                                let filePath = `public/${req.body.typename}/${req.file.filename}`;
                                if (fs.existsSync(filePath) == true) {
                                    fs.unlinkSync(filePath);
                                }
                                return {
                                    status: false,
                                    message: 'something went wrong !!!'
                                }
                            }

                        }

                    }

                }
            }
        } catch (error) {
            throw error;
        }
    }




    async blockUser(req) {
        try {
            const blockUserStatus = await userModel.findOneAndUpdate({ _id: req.params.id }, { $set: { status: 'blocked' } }, { new: true });
            if (blockUserStatus.status == 'blocked') {
                return {
                    status: true,
                    data: blockUserStatus,
                }
            }
        } catch (error) {
            throw error;
        }
    }

    async unBlockUser(req) {
        try {
            const unBlockUserStatus = await userModel.findOneAndUpdate({ _id: req.params.id }, { $set: { status: 'activated' } }, { new: true });
            if (unBlockUserStatus.status == 'activated') {
                return {
                    status: true,
                    data: unBlockUserStatus,
                }
            }
        } catch (error) {
            throw error;
        }
    }



    async getUserDetails(req) {
        try {
            const findData = await userModel.findOne({ _id: req.params.id });

            if (findData) {
                return {
                    status: true,
                    data: findData,
                }
            }
        } catch (error) {
            throw error;
        }
    }

    async adminwallet(req) {
        try {
            let conditions = {};
            const { name, mobile, email } = req.query;
            if (name) {
                conditions.username = { $regex: name };
            }

            if (mobile) {
                conditions.mobile = Number(mobile);
            }


            if (email) {
                conditions.email = { $regex: email };
            }

            let userFind = await userModel.findOne(conditions);
            if (userFind) {
                return {
                    status: true,
                    data: userFind,
                }
            }
        } catch (error) {
            throw error;
        }
    }

    async addmoneyinwallet(req) {
        try {
            const formData = req.body;
            let getAmount = Number(formData.amount);
            const mPassword = formData.master;
            const uID = formData.userid;
            let customMessage;
            const comparePassword = await adminModel.findOne({ masterpassword: mPassword });
            if (comparePassword) {

                let transactionsObj = {};
                let adminObject = {};
                const transactionOfUser = await userModel.findOne({ _id: uID });
                let creditOfUser = transactionOfUser.userbalance.balance;
                let winningOfUser = transactionOfUser.userbalance.winning;
                let bonusOfUser = transactionOfUser.userbalance.bonus;
                if (formData.bonustype == constant.ADMIN_WALLET_TYPE['ADD_FUND']) {
                    creditOfUser += getAmount;
                    transactionsObj.addfund_amt = getAmount;
                    transactionsObj.type = 'Add Fund Adjustments';
                    adminObject.bonustype = 'add_fund';
                    customMessage = `fund amount added successfully to ${transactionOfUser.username}`;
                }
                if (formData.bonustype == constant.ADMIN_WALLET_TYPE['WINNING']) {
                    winningOfUser += getAmount;
                    transactionsObj.win_amt = getAmount;
                    transactionsObj.type = 'Winning Adjustment';
                    adminObject.bonustype = 'winning';
                    customMessage = `winning amount added successfully to ${transactionOfUser.username}`;

                }
                if (formData.bonustype == constant.ADMIN_WALLET_TYPE['BONUS']) {
                    bonusOfUser += getAmount;
                    transactionsObj.bonus_amt = getAmount;
                    transactionsObj.type = 'Bonus Adjustments';
                    adminObject.bonustype = 'bonus';
                    customMessage = `bonus amount added successfully to ${transactionOfUser.username}`;

                }
                let finalBalance = creditOfUser + winningOfUser + bonusOfUser;
                const updateUserBalance = await userModel.updateOne({ _id: uID }, { $set: { 'userbalance.balance': creditOfUser, 'userbalance.winning': winningOfUser, 'userbalance.bonus': bonusOfUser } });
                transactionsObj.userid = uID;
                transactionsObj.amount = formData.amount;
                transactionsObj.total_available_amt = finalBalance;
                transactionsObj.transaction_by = `${constant.APP_SHORT_NAME}`;
                transactionsObj.transaction_id = `${constant.APP_SHORT_NAME}-EBONUS-${Date.now()}`;
                transactionsObj.bal_bonus_amt = bonusOfUser;
                transactionsObj.bal_win_amt = winningOfUser;
                transactionsObj.bal_fund_amt = creditOfUser;
                transactionsObj.paymentstatus = 'confirmed';
                adminObject.moneytype = 'add_money';
                adminObject.amount = formData.amount;
                adminObject.userid = formData.userid;
                adminObject.description = formData.description;
                const adminData = new adminWalletModel(adminObject);
                const adminDataInsert = await adminData.save();
                const data = new transactionModel(transactionsObj);
                const transitionDataInsert = await data.save();
                return {
                    status: true,
                    data: 'successfully update'
                }
            }
            else {
                return {
                    status: false,
                    data: 'Please insert correct password ⚠️',
                }
            }
        } catch (error) {
            throw error;
        }
    }
    async downloadalluserdetails(req) {
        try {
            let conditions = { userid: req.params.id }
            if (req.query.start_date) {
                conditions.createdAt = { $gte: new Date(req.query.start_date) }
            }
            if (req.query.end_date) {
                conditions.createdAt = { $lt: new Date(req.query.end_date) }
            }
            if (req.query.start_date && req.query.end_date) {
                conditions.createdAt = { $gte: new Date(req.query.start_date), $lt: new Date(req.query.end_date) }
            }
            const data = await transactionModel.find(conditions).populate('userid');
            return data;

        } catch (error) {
            throw error;
        }
    }
    async changeYotuberStatus(req) {
        try {
            const data = await userModel.findOne({ _id: mongoose.Types.ObjectId(req.params.userId) }, { type: 1, username: 1 });

            if (data.type != constant.USER_TYPE.YOUTUBER && !data.type) {
                const updateStatus = await userModel.updateOne({ _id: mongoose.Types.ObjectId(req.params.userId) }, {
                    $set: {
                        type: constant.USER_TYPE.YOUTUBER
                    }
                });
                if (updateStatus.modifiedCount > 0) {
                    return {
                        status: true,
                        message: `${data.username} youtuber type update successfully..active`
                    }
                } else {
                    return {
                        status: false,
                        message: `${data.username} youtuber type can not update ..error`
                    }
                }
            } else {
                const updateStatus = await userModel.updateOne({ _id: mongoose.Types.ObjectId(req.params.userId) }, {
                    $set: {
                        type: null
                    }
                });
                if (updateStatus.modifiedCount > 0) {
                    return {
                        status: true,
                        message: `${data.username} youtuber type update successfully..deactive`
                    }
                } else {
                    return {
                        status: false,
                        message: `${data.username} youtuber type can not update ..error`
                    }
                }
            }
        } catch (error) {
            throw error;
        }
    }
    async userFullDetails(req) {
        console.log(" req.user..................", req.user)
        const userData = await this.findUser({ _id: mongoose.Types.ObjectId(req.user._id) });
        console.log("userData..................",userData)
        if (userData.length == 0) {
          return {
            message: "User Not Found.",
            status: false,
            data: {},
          };
        }
        let verified = constant.PROFILE_VERIFY.FALSE;
        if (
          userData[0].user_verify.mobile_verify ==
          constant.PROFILE_VERIFY_EMAIL_MOBILE.VERIFY &&
          userData[0].user_verify.email_verify ==
          constant.PROFILE_VERIFY_EMAIL_MOBILE.VERIFY &&
          userData[0].user_verify.pan_verify ==
          constant.PROFILE_VERIFY_PAN_BANK.APPROVE &&
          userData[0].user_verify.bank_verify ==
          constant.PROFILE_VERIFY_PAN_BANK.APPROVE
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
            pincode: userData[0].pincode || "",
            address: userData[0].address || "",
            dob: userData[0].dob
              ? moment(userData[0].dob).format("DD-MMM-YYYY")
              : "",
            DayOfBirth: userData[0].dob
              ? moment(userData[0].dob).format("DD")
              : "12",
            MonthOfBirth: userData[0].dob
              ? moment(userData[0].dob).format("MM")
              : "10",
            YearOfBirth: userData[0].dob
              ? moment(userData[0].dob).format("YYYY")
              : "1970",
            gender: userData[0].gender || "",
            image:
              userData[0].image && userData[0].image != ""
                ? userData[0].image
                : `${constant.BASE_URL}avtar_1.jpg`,
            activation_status: userData[0].status || "",
            state: userData[0].state || "",
            city: userData[0].city || "",
            team: userData[0].team || "",
            teamfreeze:
              userData[0].team != "" ? constant.FREEZE.TRUE : constant.FREEZE.FALSE,
            refer_code: userData[0].refer_code || "",
            totalbalance: Number(userData[0].userbalance.balance).toFixed(2),
            totalwon: Number(userData[0].userbalance.winning).toFixed(2),
            totalbonus: Number(userData[0].userbalance.bonus).toFixed(2),
            totalticket: Number(userData[0].userbalance.ticket).toFixed(2),
            totalcrown: Number(userData[0].userbalance.crown),
            totalpasses: Number(userData[0].userbalance.passes).toFixed(2),
            // addcashamount: Number(userData[0].userbalance.balance).toFixed(2),
            // winningamount: Number(userData[0].userbalance.winning).toFixed(2),
            // bonusamount: Number(userData[0].userbalance.bonus).toFixed(2),
            walletamaount:
              parseFloat(userData[0].userbalance.balance.toFixed(2)) +
              parseFloat(userData[0].userbalance.winning.toFixed(2)) +
              parseFloat(userData[0].userbalance.bonus.toFixed(2)),
            verified: verified,
            downloadapk: userData[0].download_apk || constant.DOWNLOAD_APK.FALSE,
            emailfreeze:
              userData[0].email != "" &&
                userData[0].user_verify.email_verify ==
                constant.PROFILE_VERIFY_EMAIL_MOBILE.VERIFY
                ? constant.FREEZE.TRUE
                : constant.FREEZE.FALSE,
            mobilefreeze:
              userData[0].mobile != "" &&
                userData[0].user_verify.mobile_verify ==
                constant.PROFILE_VERIFY_EMAIL_MOBILE.VERIFY
                ? constant.FREEZE.TRUE
                : constant.FREEZE.FALSE,
            mobileVerified: userData[0].user_verify.mobile_verify,
            emailVerified: userData[0].user_verify.email_verify,
            PanVerified: userData[0].user_verify.pan_verify,
            BankVerified: userData[0].user_verify.bank_verify,
            statefreeze:
              userData[0].user_verify.bank_verify ==
                constant.PROFILE_VERIFY_PAN_BANK.APPROVE
                ? constant.FREEZE.TRUE
                : constant.FREEZE.FALSE,
            dobfreeze:
              userData[0].user_verify.pan_verify ==
                constant.PROFILE_VERIFY_PAN_BANK.APPROVE
                ? constant.FREEZE.TRUE
                : constant.FREEZE.FALSE,
            totalrefers: userData[0].totalrefercount, //#ReferUserCount of the join application throw referId
            totalwinning: Number(userData[0].totalwinning).toFixed(2), //# FinalResult Table user Total Amount
            totalchallenges: userData[0].totalchallenges, //# All over how many contest it was palyed not was total joining
            totalmatches: userData[0].totalmatches, // # Total Matches it's played(match.matchchallenges.joinleauge or user.totalChallengs)
            totalseries: userData[0].totalseries, //# Total Series it was played(match.matchchallenges.joinleauge in distinct or user.totalChallengs)
          },
        };
      }


}
module.exports = new UserServices();