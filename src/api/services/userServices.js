const mongoose=require('mongoose');
const userModel = require('../../models/userModel');
const transactionModel = require('../../models/transactionModel');
const adminWalletModel = require("../../models/adminWalletModel");
const adminModel = require('../../models/adminModel');
const constant = require('../../config/const_credential');
const fs=require("fs");

class UserServices {
    constructor() {
        return {
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
            if(req.fileValidationError){
                return{
                    status:false,
                    message:req.fileValidationError
                }

            }else{
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
                                if(fs.existsSync(filePath) == true){
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
    async changeYotuberStatus(req){
        try{
            const data=await userModel.findOne({_id:mongoose.Types.ObjectId(req.params.userId)},{type:1,username:1});
         
            if(data.type != constant.USER_TYPE.YOUTUBER && !data.type){
                const updateStatus=await userModel.updateOne({_id:mongoose.Types.ObjectId(req.params.userId)},{
                    $set:{
                        type:constant.USER_TYPE.YOUTUBER
                    }
                });
                if(updateStatus.modifiedCount > 0){
                    return{
                        status:true,
                        message:`${data.username} youtuber type update successfully..active`
                    }
                }else{
                    return{
                        status:false,
                        message:`${data.username} youtuber type can not update ..error`
                    }
                }
            }else{
                const updateStatus=await userModel.updateOne({_id:mongoose.Types.ObjectId(req.params.userId)},{
                    $set:{
                        type:null
                    }
                });
                if(updateStatus.modifiedCount > 0){
                    return{
                        status:true,
                        message:`${data.username} youtuber type update successfully..deactive`
                    }
                }else{
                    return{
                        status:false,
                        message:`${data.username} youtuber type can not update ..error`
                    }
                }
            }
        }catch(error){
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