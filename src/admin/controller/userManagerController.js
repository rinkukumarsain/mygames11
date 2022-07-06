const moment = require("moment");
const mongoose = require('mongoose');
const userModel = require('../../models/userModel');
const transactionModel = require('../../models/transactionModel');
const adminWalletModel = require("../../models/adminWalletModel");
const adminModel = require('../../models/adminModel');
const constant = require('../../config/const_credential');
const UserServices = require('../services/userServices');
const excel = require("exceljs");


class userManagerController {
    constructor() {
        return {
            view_AllUsers: this.view_AllUsers.bind(this),
            view_users_datatable: this.view_users_datatable.bind(this),
            viewtransactions: this.viewtransactions.bind(this),
            viewTransactionsDataTable: this.viewTransactionsDataTable.bind(this),
            blockUser: this.blockUser.bind(this),
            unBlockUser: this.unBlockUser.bind(this),
            editUserDetails_page: this.editUserDetails_page.bind(this),
            edituserdetails: this.edituserdetails.bind(this),
            userswallet: this.userswallet.bind(this),
            userswallet_table: this.userswallet_table.bind(this),
            wallet_list: this.wallet_list.bind(this),
            adminwallet: this.adminwallet.bind(this),
            getUserDetails: this.getUserDetails.bind(this),
            addmoneyinwallet: this.addmoneyinwallet.bind(this),
            deductmoneyinwallet: this.deductmoneyinwallet.bind(this),
            adminwallet_dataTable: this.adminwallet_dataTable.bind(this),
            downloadalluserdetails:this.downloadalluserdetails.bind(this),
        }
    }

    async view_AllUsers(req, res, next) {
        try {
            res.locals.message = req.flash();
            const { status, name, email, mobile } = req.query;
            res.render("users/viewAllUsers", { sessiondata: req.session.data, selectQuery: status, selectQuery3: status, selectQuery2: status, teamName: name, emailValue: email, mobileNo: mobile });
        } catch (error) {
            //    next(error);
            req.flash('error', '..server error..');
            res.redirect("/");
        }
    }

    async view_users_datatable(req, res, next) {
        try {
            let limit1 = req.query.length;
            let start = req.query.start;
            let sortObject = {},
                dir,
                join,
                conditions = {};
            let name;
            if (req.query.email) {
                conditions.email = { $regex: req.query.email };
            }
            if (req.query.mobile) {
                conditions.mobile = req.query.mobile;
            }
            if (req.query.name) {
                conditions.team = { $regex: new RegExp("^" + req.query.name.toLowerCase(), "i") };
            }
            if (req.query.status == constant.USER_STATUS.ACTIVATED) {
                conditions.status = req.query.status;
            }
            if (req.query.status == constant.USER_STATUS.BLOCKED) {
                conditions.status = req.query.status;
            }
            if (req.query.status==3) {
                conditions['user_verify.bank_verify'] = -1;
            }
            if (req.query.status==4) {
                conditions['user_verify.pan_verify'] = -1;
            }

            userModel.countDocuments(conditions).exec((err, rows) => {
                let totalFiltered = rows;
                let data = [];
                let count = 1;
                userModel.find(conditions).skip(Number(start) ? Number(start) : '').limit(Number(limit1) ? Number(limit1) : '').sort(sortObject).exec((err, rows1) => {
                    if (err) console.log(err);
                    rows1.forEach((index) => {
                        let userStatus = index.status;
                        let blockLink;
                        if (userStatus == constant.USER_STATUS.ACTIVATED) {
                            blockLink = `<a class="dropdown-item" style="cursor: pointer;" data-toggle="tooltip dropdown-item" title="Delete"
                            onclick="delete_sweet_alert('/blockuser/${index._id}', 'Are you sure you want to Block ${index.username} ?')">
                            Block
                        </a>`;
                        } else {
                            blockLink = `<a class="dropdown-item" style="cursor: pointer;" data-toggle="tooltip dropdown-item" title="Delete"
                            onclick="save_sweet_alert('/unblockuser/${index._id}', 'Are you sure you want to Unblock ${index.username} ?')">
                            Unblock
                        </a>`;
                        }
                        let mobileVerifcation = index.user_verify.mobile_verify;
                        let emailVerifcation = index.user_verify.email_verify;
                        let panVerifcation = index.user_verify.pan_verify;
                        let bankVerifcation = index.user_verify.bank_verify;
                        // FOR CHECK MOBILE VERIFICATION    
                        let mobileContent;
                        mobileVerifcation == 1 ? mobileContent = "fas fa-check-circle fs-15 text-success position-relative top-n13px left-n6px rounded-pill bg-white" :
                            mobileVerifcation == 0 ? mobileContent = "fas fa-times-circle fs-15 text-warning position-relative top-n13px left-n6px rounded-pill bg-white" :
                                mobileContent = "fas fa-question-circle fs-15 text-danger position-relative top-n13px left-n6px rounded-pill bg-white";

                        // FOR CHECK EMAIL VERIFICATION    
                        let emailContent;
                        emailVerifcation == 1 ? emailContent = "fas fa-check-circle fs-15 text-success position-relative top-n13px left-n6px rounded-pill bg-white" :
                            emailVerifcation == 0 ? emailContent = "fas fa-times-circle fs-15 text-warning position-relative top-n13px left-n6px rounded-pill bg-white" :
                                emailContent = "fas fa-question-circle fs-15 text-danger position-relative top-n13px left-n6px rounded-pill bg-white";

                        // FOR CHECK PAN VERIFICATION
                        let panContent;
                        if(panVerifcation == 1){
                            panContent = "fas fa-check-circle fs-15 text-success position-relative top-n13px left-n6px rounded-pill bg-white" 
                        }else if(panVerifcation == 0){
                            panContent = "fas fa-times-circle fs-15 text-warning position-relative top-n13px left-n6px rounded-pill bg-white"
                        }else if(panVerifcation == 2){
                            panContent = "fas fa-times-circle fs-15 text-danger position-relative top-n13px left-n6px rounded-pill bg-white";
                        }else{
                            panContent = "fas fa-question-circle fs-15 text-danger position-relative top-n13px left-n6px rounded-pill bg-white";
                        }
                       
                        // FOR CHECK BANK VERIFICATION
                        let bankContent;
                        if(bankVerifcation == 1){
                            bankContent="fas fa-check-circle fs-15 text-success position-relative top-n13px left-n6px rounded-pill bg-white"
                        }else if(bankVerifcation == 0){
                            bankContent = "fas fa-times-circle fs-15 text-warning position-relative top-n13px left-n6px rounded-pill bg-white"
                        }else if(bankVerifcation == 2 ){
                            bankContent ="fas fa-times-circle fs-15 text-danger position-relative top-n13px left-n6px rounded-pill bg-white";
                        }else{
                            bankContent ="fas fa-question-circle fs-15 text-danger position-relative top-n13px left-n6px rounded-pill bg-white";
                        }
                        
                        data.push({
                            id: count,
                            username: index.username,
                            team: index.team,
                            email: `<a href="/getUserDetails/${index._id}">${index.email}</a>`,
                            mobile: index.mobile || '',
                            verification: `<i class="fad fa-mobile fs-20 ml-3 text-secondary"></i>
                            <i class= "${mobileContent}"></i>
                            <span class="font-weight-bold text-light"><i class="fad fa-envelope fs-20 ml-3 text-secondary"></i>
                            <i class= "${emailContent}"></i></span>
                            <span class="font-weight-bold text-light"><i class="fad fa-id-card fs-20 ml-3 text-secondary"></i>
                            <i class="${panContent}"></i></span>
                            <span class="font-weight-bold text-light"><i class="fad fa-university fs-20 ml-3 text-secondary"></i>
                            <i class="${bankContent}"></i></span>`,
                            total_refers: "t refer",
                            refer_amount: "refer amount",
                            refercode: index.refer_code || '',
                            action: `<div class="dropdown">
                            <button class="btn btn-primary btn-md rounded-pill dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                              Action
                            </button>
                            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                              <a class="dropdown-item" href="/viewtransactions/${index._id}">User Transactions</a>
                             ${blockLink}
                              <a class="dropdown-item" href="#">Active Youtuber</a>
                              <a class="dropdown-item" href="/editUserDetails-page/${index._id}">Edit User Details</a>
                            </div>
                          </div>`
                        });
                        count++;
                        if (count > rows1.length) {
                            let json_data = JSON.stringify({
                                recordsTotal: rows,
                                recordsFiltered: totalFiltered,
                                data: data,
                            });
                            res.send(json_data);
                        }
                    });
                });
            });
        } catch (error) {
            throw error;
        }
    }

    async viewtransactions(req, res, next) {
        try {
            const findTransactions = await UserServices.viewtransactions(req);
            if (findTransactions.status == true) {
                const { start_date, end_date, challengeid } = req.query;
                res.render("users/viewTransactions", { sessiondata: req.session.data, findTransactionsId: findTransactions.data.userid, start_date: start_date, end_date: end_date, challengeid: challengeid });
            }
        } catch (error) {
            req.flash("warning", "No transaction to show");
            res.redirect("/view_all_users");
        }
    }

    async viewTransactionsDataTable(req, res, next) {
        try {
            let limit1 = req.query.length;
            let start = req.query.start;
            let sortObject = {},
                dir,
                join,
                conditions = { userid: req.params.id };
            let name;
            if (req.query.start_date) {
                conditions.createdAt = { $gte: new Date(req.query.start_date) }
            }
            if (req.query.end_date) {
                conditions.createdAt = { $lt: new Date(req.query.end_date) }
            }


            if (req.query.start_date && req.query.end_date) {
                conditions.createdAt = { $gte: new Date(req.query.start_date), $lt: new Date(req.query.end_date) }
            }

            if (req.query.challengeid) {
                conditions.challengeid = mongoose.Types.ObjectId(req.query.challengeid)
            }
            
            let arr_cr = ['Bank verification bank bonus', 'Email bonus', 'Mobile bonus', 'Cash added', 'Refund amount', 'Challenge Winning Amount', 'Refund', 'Pan verification pan bonus', 'special  ', 'Youtuber Bonus', 'Referred Signup bonus', 'Winning Adjustment', 'Add Fund Adjustments', 'Bonus Adjustments', 'Refer Bonus', 'withdraw cancel', 'Amount Withdraw Failed'];
            let arr_db = ['Amount Withdraw', 'Contest Joining Fee'];

            transactionModel.countDocuments(conditions).exec((err, rows) => {
                let totalFiltered = rows;
                let data = [];
                let count = 1;
                transactionModel.find(conditions).skip(Number(start) ? Number(start) : '').limit(Number(limit1) ? Number(limit1) : '').sort(sortObject).exec((err, rows1) => {
                    if (err) console.log(err);
                    rows1.forEach((index) => {
                        const dateby = index.createdAt;
                        let setDate = moment(dateby).format(
                            "DD-MM-YYYY"
                        );
                        let setTime = moment(dateby).format(
                            "h:mm:ss"
                        );
                        data.push({
                            id: `<a href="/getUserDetails/${index.userid}">${count}</a>`,
                            date: `<span class="text-warning">${setDate}</span> <span class="text-success">${setTime}</span>`,
                            amt: index.amount,
                            ttype: arr_cr.includes(index.type) ? 'Credit' : 'Debit',
                            treason: index.type,
                            bonusA: index.bal_bonus_amt,
                            bonusC: index.bonus_amt,
                            bonusD: index.cons_bonus,
                            winningA: index.bal_win_amt,
                            winningC: index.win_amt,
                            winningD: index.cons_win,
                            balanceA: index.bal_fund_amt,
                            balanceC: index.addfund_amt,
                            balanceD: index.cons_amount,
                            total: index.total_available_amt
                        });
                        count++;
                        if (count > rows1.length) {
                            let json_data = JSON.stringify({
                                recordsTotal: rows,
                                recordsFiltered: totalFiltered,
                                data: data,
                            });
                            res.send(json_data);
                        }
                    });
                });
            });

        } catch (error) {
            throw error;
        }

    }

    async editUserDetails_page(req, res, next) {
        try {
            const editUserData = await UserServices.editUserDetails_page(req);
            if (editUserData.status == true) {
                res.render("users/editUserDetails", { sessiondata: req.session.data, editUserData: editUserData.data });
            } else {
                req.flash("error", "Something went wrong");
                res.redirect("/view_all_users")
            }
        } catch (error) {
            req.flash("error", "Something went wrong");
            res.redirect("/")
        }

    }

    async edituserdetails(req, res, next) {
        try {
            const updateData = await UserServices.edituserdetails(req);
            if (updateData.status == true) {
                req.flash("success", "user data updated successfully");
                res.redirect("/view_all_users");
            } else {
                req.flash("warning", "wrong update credentials");
                res.redirect("/view_all_users");
            }
        } catch (error) {
            req.flash("error", "something went wrong");
            res.redirect("/view_all_users");
        }
    }

    async userswallet(req, res, next) {
        try {
            const { name, email, mobile, team } = req.query;
            let totalBonus = 0;
            let totalWinning = 0;
            let totalBalance = 0;
            let finalTotal = 0;
            let condition = {};
            let repeatValues = function (allfind) {
                let arrayValues = [];
                for (let values of allfind) {
                    let obj = {};
                    obj.balance = values.userbalance.balance;
                    obj.winning = values.userbalance.winning;
                    obj.bonus = values.userbalance.bonus;
                    obj.username = values.username;
                    arrayValues.push(obj)
                }
                arrayValues.forEach((element) => {
                    if (element.balance) totalBalance += element.balance;
                    if (element.winning) totalWinning += element.winning;
                    if (element.bonus) totalBonus += element.bonus;
                });
                finalTotal = totalBalance + totalBonus + totalWinning;
            }
            if (mobile) {
                condition.mobile = Number(mobile);
            }
            if (email) {
                condition.email = { $regex: email };
            }
            if (name) {
                condition.username = { $regex: new RegExp("^" + req.query.name.toLowerCase(), "i") }

            }
            if (team) {
                condition.team = { $regex: new RegExp("^" + req.query.team.toLowerCase(), "i") }

            }
            const findByteamname = await userModel.find(condition);
            if (findByteamname.length > 0) {
                repeatValues(findByteamname);
                res.render("users/usersWallet", { sessiondata: req.session.data, name, email, mobile, team, totalBonus, totalWinning, totalBalance, finalTotal });
            }
            else {
                res.render("users/usersWallet", { sessiondata: req.session.data, name, email, mobile, team, totalBonus, totalWinning, totalBalance, finalTotal });

            }
        } catch (error) {
            //    next(error);
            req.flash('error', 'Something went wrong please try again');
            res.redirect("/");
        }
    }

    async userswallet_table(req, res, next) {
        try {
            let limit1 = req.query.length;
            let start = req.query.start;
            let sortObject = {},
                dir,
                join,
                conditions = {};
            let name;
            if (req.query.name) {
                conditions.username = { $regex: new RegExp("^" + req.query.name.toLowerCase(), "i") };
            }
            if (req.query.email) {
                conditions.email = { $regex: new RegExp("^" + req.query.email.toLowerCase(), "i") };
            }
            if (req.query.mobile) {
                conditions.mobile = Number(req.query.mobile);
            }
            if (req.query.team) {
                conditions.team = { $regex: new RegExp("^" + req.query.team.toLowerCase(), "i") };
            }
            userModel.countDocuments(conditions).exec((err, rows) => {
                let totalFiltered = rows;
                let data = [];
                let count = 1;
                userModel.find(conditions).skip(Number(start) ? Number(start) : '').limit(Number(limit1) ? Number(limit1) : '').sort(sortObject).exec((err, rows1) => {
                    if (err) console.log(err);
                    rows1.forEach((index) => {
                        data.push({
                            id: count,
                            userid: `<a href="/getUserDetails/${index._id}">${index._id}</a>`,
                            username: index.username,
                            team: index.team,
                            email: index.email,
                            mobile: index.mobile,
                            date: `<span class="text-warning">${moment().format("DD-MM-YYYY")}</span>`,
                            balance: `Rs.${index.userbalance.balance}`,
                            winning: `Rs.${index.userbalance.winning}`,
                            bonus: `Rs.${index.userbalance.bonus}`,
                            total: `Rs.${index.userbalance.balance + index.userbalance.winning + index.userbalance.bonus}`,
                        });
                        count++;
                        if (count > rows1.length) {
                            let json_data = JSON.stringify({
                                recordsTotal: rows,
                                recordsFiltered: totalFiltered,
                                data: data,
                            });
                            res.send(json_data);
                        }
                    });
                });
            });
        } catch (error) {
            throw error;
        }
    }

    async blockUser(req, res, next) {
        try {
            const blockUserStatus = await UserServices.blockUser(req);
            if (blockUserStatus.status == true) {
                let customMessage = `successfully blocked ${blockUserStatus.data.username}`;
                req.flash('success', customMessage);
                res.redirect('/view_all_users');
            }
        } catch (error) {
            req.flash('warning', 'something went wrong');
            res.redirect('/view_all_users');
        }
    }

    async unBlockUser(req, res, next) {
        try {
            const unBlockUserStatus = await UserServices.unBlockUser(req)
            if (unBlockUserStatus.status == true) {
                let customMessage = `successfully unblocked ${unBlockUserStatus.data.username}`;
                req.flash('success', customMessage);
                res.redirect('/view_all_users');
            }
        } catch (error) {
            req.flash('warning', 'something went wrong');
            res.redirect('/view_all_users');
        }
    }

    async wallet_list(req, res, next) {
        try {
            res.locals.message = req.flash();
            res.render("users/walletList", { sessiondata: req.session.data });
        } catch (error) {
            //    next(error);
            req.flash('error', 'Something went wrong please try again');
            res.redirect("/");
        }
    }

    async getUserDetails(req, res, next) {
        try {
            const getUserData = await UserServices.getUserDetails(req);
            if (getUserData.status == true) {
                res.render("users/getuserDetails", { sessiondata: req.session.data, getUserData: getUserData.data });
            } else {
                req.flash("warning", "unable to fetch details of user");
                res.redirect("/");
            }
        } catch (error) {
            req.flash("error", "something went wrong");
            res.redirect("/");
        }
    }

    async adminwallet(req, res, next) {
        try {
            res.locals.message = req.flash();
            if (req.query.name == '' && req.query.mobile == '' && req.query.email == '' || Object.keys(req.query).length == 0) {
                res.render("users/adminWallet", { sessiondata: req.session.data, name: undefined, mobile: undefined, email: undefined, userFind: undefined });
            }
            if (Object.keys(req.query).length > 0) {
                const userfind = await UserServices.adminwallet(req);
                if (userfind.status == true) {
                    const { name, mobile, email } = req.query;
                    res.render("users/adminWallet", { sessiondata: req.session.data, name: name, mobile: mobile, email: email, userFind: userfind.data });
                }
            }
        } catch (error) {
            req.flash("warning", "no User Found Please try again");
            res.redirect("/adminwallet");
        }
    }

    async addmoneyinwallet(req, res, next) {
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
                req.flash('success', customMessage);
                res.redirect("/wallet-list");
            } else {
                req.flash('danger', 'Please insert correct password ⚠️');
                res.redirect(`/adminwallet?${formData.userid}`);
            }
        } catch (error) {
            req.flash('error', '..server error..');
            res.redirect("/");
        }
    }

    async deductmoneyinwallet(req, res, next) {
        try {
            res.locals.message = req.flash();
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
                let finalamount = 0;
                if ((formData.bonustype == constant.ADMIN_WALLET_TYPE['ADD_FUND']) && creditOfUser >= getAmount) {
                    creditOfUser = creditOfUser - getAmount;
                    adminObject.amount = formData.amount;
                    adminObject.bonustype = 'add_fund';
                    adminObject.moneytype = 'deduct_money';
                    customMessage = `fund amount deducted from ${transactionOfUser.username}`;
                    adminObject.userid = formData.userid;
                    adminObject.description = formData.description;
                    transactionsObj.cons_amount = getAmount;
                    finalamount = bonusOfUser + creditOfUser + winningOfUser;
                    transactionsObj.amount = getAmount;
                    transactionsObj.type = 'Deduct Fund';
                    transactionsObj.total_available_amt = finalamount;
                    transactionsObj.transaction_by = `${constant.APP_SHORT_NAME}`;
                    transactionsObj.transaction_id = `${constant.APP_SHORT_NAME}-EBONUS-${Date.now()}`;
                    transactionsObj.userid = uID;
                    transactionsObj.paymentstatus = 'confirmed';
                    transactionsObj.bal_bonus_amt = bonusOfUser;
                    transactionsObj.bal_win_amt = winningOfUser;
                    transactionsObj.bal_fund_amt = creditOfUser;

                    const updateUserBalance = await userModel.updateOne({ _id: uID }, { $set: { 'userbalance.balance': creditOfUser, 'userbalance.winning': winningOfUser, 'userbalance.bonus': bonusOfUser } });
                    const adminData = new adminWalletModel(adminObject);
                    const adminDataInsert = await adminData.save();
                    const data = new transactionModel(transactionsObj);
                    const transitionDataInsert = await data.save();
                    req.flash('success', customMessage);
                    res.redirect("/wallet-list")
                } else if ((formData.bonustype == constant.ADMIN_WALLET_TYPE['WINNING']) && winningOfUser >= getAmount) {

                    winningOfUser = winningOfUser - getAmount;
                    adminObject.amount = formData.amount;
                    adminObject.userid = formData.userid;
                    adminObject.description = formData.description;
                    transactionsObj.cons_win = getAmount;
                    customMessage = `winning amount deducted from ${transactionOfUser.username}`;
                    finalamount = bonusOfUser + creditOfUser + winningOfUser;
                    transactionsObj.amount = getAmount;
                    adminObject.bonustype = 'winning';
                    adminObject.moneytype = 'deduct_money';
                    transactionsObj.type = 'Deduct Winning Amount';
                    transactionsObj.total_available_amt = finalamount;
                    transactionsObj.transaction_by = `${constant.APP_SHORT_NAME}`;
                    transactionsObj.transaction_id = `${constant.APP_SHORT_NAME}-EBONUS-${Date.now()}`;
                    transactionsObj.userid = uID;
                    transactionsObj.paymentstatus = 'confirmed';
                    transactionsObj.bal_bonus_amt = bonusOfUser;
                    transactionsObj.bal_win_amt = winningOfUser;
                    transactionsObj.bal_fund_amt = creditOfUser;

                    const updateUserBalance = await userModel.updateOne({ _id: uID }, { $set: { 'userbalance.balance': creditOfUser, 'userbalance.winning': winningOfUser, 'userbalance.bonus': bonusOfUser } });
                    const adminData = new adminWalletModel(adminObject);
                    const adminDataInsert = await adminData.save();
                    const data = new transactionModel(transactionsObj);
                    const transitionDataInsert = await data.save();
                    req.flash('success', customMessage);
                    res.redirect("/wallet-list");
                } else if ((formData.bonustype == constant.ADMIN_WALLET_TYPE['BONUS']) && bonusOfUser >= getAmount) {
                    bonusOfUser = bonusOfUser - getAmount;
                    adminObject.amount = formData.amount;
                    adminObject.userid = formData.userid;
                    adminObject.bonustype = 'bonus';
                    customMessage = `bonus amount deducted from ${transactionOfUser.username}`;
                    adminObject.description = formData.description;
                    transactionsObj.cons_bonus = getAmount;
                    finalamount = bonusOfUser + creditOfUser + winningOfUser;
                    transactionsObj.amount = getAmount;
                    transactionsObj.type = 'Deduct Bonus Amount';
                    adminObject.moneytype = 'deduct_money';
                    transactionsObj.total_available_amt = finalamount;
                    transactionsObj.transaction_by = `${constant.APP_SHORT_NAME}`;
                    transactionsObj.transaction_id = `${constant.APP_SHORT_NAME}-EBONUS-${Date.now()}`;
                    transactionsObj.userid = uID;
                    transactionsObj.paymentstatus = 'confirmed';
                    transactionsObj.bal_bonus_amt = bonusOfUser;
                    transactionsObj.bal_win_amt = winningOfUser;
                    transactionsObj.bal_fund_amt = creditOfUser;
                    const updateUserBalance = await userModel.updateOne({ _id: uID }, { $set: { 'userbalance.balance': creditOfUser, 'userbala nce.winning': winningOfUser, 'userbalance.bonus': bonusOfUser } });
                    const adminData = new adminWalletModel(adminObject);
                    const adminDataInsert = await adminData.save();
                    const data = new transactionModel(transactionsObj);
                    const transitionDataInsert = await data.save();
                    req.flash('success', customMessage);
                    res.redirect("/wallet-list");
                } else {
                    req.flash('warning', 'amount exceed ⚠️');
                    res.redirect("/wallet-list");
                }
            } else {
                req.flash('danger', 'wrong password ⚠️');
                res.redirect(`/adminwallet?${formData.userid}`);
            }
        } catch (error) {
            req.flash('error', '..server error..');
            res.redirect("/");
        }
    }


    async adminwallet_dataTable(req, res, next) {
        try {
            let limit1 = req.query.length;
            let start = req.query.start;
            let sortObject = {},
                dir,
                join,
                conditions = {};
            let name;
            adminWalletModel.countDocuments(conditions).exec((err, rows) => {
                let totalFiltered = rows;
                let data = [];
                let count = 1;
                adminWalletModel.find(conditions).populate({ path: "userid", select: ["username", "_id", "email", "mobile"] }).skip(Number(start) ? Number(start) : '').limit(Number(limit1) ? Number(limit1) : '').sort(sortObject).exec((err, rows1) => {
                    if (err) console.log(err);
                    rows1.forEach((index) => {
                        data.push({
                            Sno: count,
                            username: `<a style="text-decoration:none;" href="/getUserDetails/${index.userid._id}">${index.userid.username}</span>`,
                            mobile: `<span style="color:black;">${index.userid.mobile}</span>`,
                            email: `<span style="color:black;">${index.userid.email}</span>`,
                            amount: `<span style="color:black;"">${index.amount}</span>`,
                            bonus_type: `<span style="color:black;"">${index.bonustype}</span>`,
                            created_at: `<span class="text-danger">${moment(index.createdAt).format("YYYY-MM-DD HH:mm")}</span>`,
                            description: `<span style = "color: black;">${index.description}</span>`
                        });
                        count++;
                        if (count > rows1.length) {
                            let json_data = JSON.stringify({
                                recordsTotal: rows,
                                recordsFiltered: totalFiltered,
                                data: data,
                            });
                            res.send(json_data);
                        }
                    });
                });
            });
        } catch (error) {
            throw error;
        }
    }
    async downloadalluserdetails(req,res,next){
        try{
            
            const getData=await UserServices.downloadalluserdetails(req);
                let UserTransaction = [];
                let arr_cr = ['Bank verification bank bonus', 'Email bonus', 'Mobile bonus', 'Cash added', 'Refund amount', 'Challenge Winning Amount', 'Refund', 'Pan verification pan bonus', 'special  ', 'Youtuber Bonus', 'Referred Signup bonus', 'Winning Adjustment', 'Add Fund Adjustments','Bonus Adjustments', 'Refer Bonus', 'withdraw cancel', 'Amount Withdraw Failed'];
                let arr_db = ['Amount Withdraw', 'Contest Joining Fee'];
                let count =0;
                getData.forEach((index) => {
                    const dateby = index.createdAt;
                    let setDate = moment(dateby).format(
                        "DD-MM-YYYY"
                    );
                    let setTime = moment(dateby).format(
                        "h:mm:ss"
                    );
                    UserTransaction.push({
                        mobile:index.userid.mobile,
                        email:index.userid.email,
                        date: `${setDate} ${setTime}`,
                        amt: index.amount,
                        ttype: arr_cr.includes(index.type) ? 'Credit' : 'Debit',
                        treason: index.type,
                        bonusA: index.bal_bonus_amt,
                        bonusC: index.bonus_amt,
                        bonusD: index.cons_bonus,
                        winningA: (index.bal_win_amt).toFixed(),
                        winningC: index.win_amt,
                        winningD: index.cons_win,
                        balanceA: (index.bal_fund_amt).toFixed(),
                        balanceC: index.addfund_amt,
                        balanceD: index.cons_amount,
                        total: index.total_available_amt
                    });
                    count++;
                   
                });
                // -------
                let workbook = new excel.Workbook();
                let worksheet = workbook.addWorksheet("UserTransaction");
                worksheet.columns = [
                    { header: "Email Id", key: "email", width: 30 },
                    { header: "Mobile", key: "mobile", width: 20 },
                  { header: "Date", key: "date", width: 30 },
                  { header: "Amount", key: "amt", width: 10 },
                  { header: "T.Type", key: "ttype", width: 10 },
                  { header: "T.Reason", key: "treason", width: 25 },
                  { header: "bonusA", key: "bonusA", width: 10 },
                  { header: "bonusC", key: "bonusC", width: 10 },
                  { header: "bonusD", key: "bonusD", width: 10 },
                  { header: "winningA", key: "winningA", width: 10 },
                  { header: "winningC", key: "winningC", width: 10 },
                  { header: "winningD", key: "winningD", width: 10 },
                  { header: "balanceA", key: "balanceA", width: 10 },
                  { header: "balanceC", key: "balanceC", width: 10 },
                  { header: "balanceD", key: "balanceD", width: 10 },
                  { header: "total", key: "total", width: 10 },
                ];
                // Add Array Rows
                worksheet.addRows(UserTransaction);
                res.setHeader(
                  "Content-Type",
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                );
                res.setHeader(
                  "Content-Disposition",
                  "attachment; filename=" + "UserTransaction.xlsx"
                );
                return workbook.xlsx.write(res).then(function () {
                  res.status(200).end();
                });
            

        }catch(error){
            throw error;
        }
    }
}
module.exports = new userManagerController();