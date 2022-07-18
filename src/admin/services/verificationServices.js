const userModel = require('../../models/userModel');
const withdrawalModel = require('../../models/withdrawModel');
const withdrawRequestModel = require('../../models/withdrawRequestModel');
const constant = require('../../config/const_credential');
const moment = require("moment");

const GetBouns = require('../../utils/getBonus');
const userServicesAPI = require('../../api/services/userServices')
const cashFree = require('@cashfreepayments/cashfree-sdk');
const path = require('path');
const mongoose = require('mongoose');
class verificationServices {
    constructor() {
        return {
            viewPan_Details: this.viewPan_Details.bind(this),
            update_Pan_Details: this.update_Pan_Details.bind(this),
            editPan_Details: this.editPan_Details.bind(this),
            viewBank_Details: this.viewBank_Details.bind(this),
            editBank_Details: this.editBank_Details.bind(this),
            update_Bank_Details: this.update_Bank_Details.bind(this),
            approve_withdraw_request: this.approve_withdraw_request.bind(this),
            reject_withdraw_request: this.reject_withdraw_request.bind(this)
        }
    }

    async viewPan_Details(req) {
        try {
            const findUser = await userModel.findOne({ _id: req.params.id });
            if (findUser) {
                return {
                    status: true,
                    data: findUser,
                }
            }
        } catch (error) {
            throw error;
        }
    }

    async update_Pan_Details(req) {
        try {
            console.log(req.body.panstatus, '<<<<<<<<<<<<--------------------');
            let abc;
            if (req.body.panstatus == 1) {
                const panBonus = await new GetBouns().getBonus(constant.BONUS_TYPES.PAN_BONUS, constant.PROFILE_VERIFY_PAN_BANK.SUBMITED);
                console.log(`panCredentials-------${req.body.userid}-------here`, panBonus);

                abc = await userServicesAPI.givebonusToUser(
                    panBonus,
                    req.body.userid,
                    constant.PROFILE_VERIFY_BONUS_TYPES.PAN_BONUS,
                    constant.USER_VERIFY_TYPES.PAN_VERIFY
                );
            }
            if (req.body.panstatus == 2) {
                const panCredentials = await userModel.findOneAndUpdate({ _id: req.body.userid }, { $set: { 'pancard.status': req.body.panstatus, 'user_verify.pan_verify': req.body.panstatus, 'pancard.comment': req.body.comment || '' } }, { new: true });
                if (!panCredentials) {
                    return {
                        status: false,
                        message: 'pan status can not update..error'
                    }
                } else {
                    return {
                        status: true,
                        message: 'pan rejected successfully ...',
                        data: panCredentials,
                    }
                }
            }
            if (abc) {
                const panCredentials = await userModel.findOneAndUpdate({ _id: req.body.userid }, { $set: { 'pancard.status': req.body.panstatus, 'user_verify.pan_verify': req.body.panstatus, 'pancard.comment': req.body.comment || '' } }, { new: true });
                // console.log(`panCredentials`, panCredentials);
                if (!panCredentials) {
                    return {
                        status: false
                    }
                } else {
                    return {
                        status: true,
                        data: panCredentials,
                    }
                }
            }
        } catch (error) {
            throw error;
        }
    }
    async editPan_Details(req) {
        try {
            const findUser = await userModel.findOne({ _id: req.params.id })
            if (findUser) {
                return {
                    status: true,
                    data: findUser,
                }
            }
        } catch (error) {
            throw error;
        }
    }

    //  async Update_Credentials_Pan(req) {
    //     try {
    //          const updatePan = await userModel.findOneAndUpdate({_id:req.body.userid},{$set:{'pancard.pan_dob':req.body.DOB,'pancard.pan_name':req.body.pan_name.toUpperCase(),'pancard.status':req.body.status,'user_verify.pan_verify':req.body.status,'pancard.comment':req.body.comment || ''}},{new:true})
    //          if(!updatePan){
    //             return{
    //                 status:false
    //        }
    //    }else{
    //        return{
    //            status:true,
    //            data:updatePan,
    //        }
    //         }      
    //     } catch (error) {
    //        throw error;
    //     }
    // }
    // async Update_Credentials_Bank(req){
    //     try {
    //         const dataUpdate = await userModel.findOneAndUpdate({ _id: req.body.userid }, {
    //             $set: {
    //                 'bank.accno': req.body.accno,
    //                 'bank.ifsc': req.body.ifsc.toUpperCase(),
    //                 'bank.bankname': req.body.bankname,
    //                 'bank.bankbranch': req.body.bankbranch,
    //                 'bank.state': req.body.state,
    //                 'bank.status': req.body.status,
    //                 'user_verify.bank_verify': req.body.status,
    //                 'bank.comment': req.body.comment || '',
    //             }
    //         }, { new: true });
    //         if(!dataUpdate){
    //             return{
    //                 status:false
    //        }
    //    }else{
    //        return{
    //            status:true,
    //            data:dataUpdate,
    //        }
    //         }      

    //     } catch (error) {
    //         throw error;
    //     }
    // }



    async viewBank_Details(req) {
        try {
            const viewUser = await userModel.findOne({ _id: req.params.id });
            if (viewUser) {
                return {
                    status: true,
                    data: viewUser,
                }
            }
        } catch (error) {
            throw error;
        }
    }
    async editBank_Details(req) {
        try {
            const findUser = await userModel.findOne({ _id: req.params.id });
            if (findUser) {
                return {
                    status: true,
                    data: findUser,
                }
            }
        } catch (error) {
            throw error;
        }
    }
    async update_Bank_Details(req) {
        try {
            let abc;
            console.log(req.body.bankstatus, 'req.body.bankstatus');
            if (req.body.bankstatus == 1) {
                const bankBonus = await new GetBouns().getBonus(constant.BONUS_TYPES.BANK_BONUS, constant.PROFILE_VERIFY_PAN_BANK.SUBMITED);

                abc = await userServicesAPI.givebonusToUser(
                    bankBonus,
                    req.body.userid,
                    constant.PROFILE_VERIFY_BONUS_TYPES.BANK_BONUS,
                    constant.USER_VERIFY_TYPES.BANK_VERIFY
                );

            } else if (req.body.bankstatus == 2) {
                const bankCredentials = await userModel.findOneAndUpdate({ _id: req.body.userid }, { $set: { 'bank.status': req.body.bankstatus, 'user_verify.bank_verify': req.body.bankstatus, 'bank.comment': req.body.comment || '' } }, { new: true });
                if (!bankCredentials) {
                    return {
                        status: false,
                        message: 'bank status can not update..error'
                    }
                } else {
                    return {
                        status: true,
                        message: 'bank rejected successfully ...',
                        data: bankCredentials,
                    }
                }
            }
            if (abc) {
                const bankCredentials = await userModel.findOneAndUpdate({ _id: req.body.userid }, { $set: { 'bank.status': req.body.bankstatus, 'user_verify.bank_verify': req.body.bankstatus, 'bank.comment': req.body.comment || '' } }, { new: true });
                if (!bankCredentials) {
                    return {
                        status: false,
                        message: 'bank status can not update..error'
                    }
                } else {
                    return {
                        status: true,
                        message: 'update successfully ..',
                        data: bankCredentials,
                    }
                }
            }
        } catch (error) {
            throw error;
        }
    }

    async approve_withdraw_request(req) {
        try {
            // const findUserAmount = await userModel.findOne({ _id: req.params.id });
            const amount = Number(req.query.amount);
            // const userAmount = findUserAmount.withdrawamount;
            // const newAmount = amount + userAmount;
            // const updateUserAmount = await userModel.findOne({ _id: req.params.id }, { $set: { withdrawamount: newAmount } }, { new: true });
            const pipeline = [];
            pipeline.push({
                $match: {
                    _id: mongoose.Types.ObjectId(req.query.withdrawalId),
                    status: 0
                }
            })

            pipeline.push({
                $lookup: {
                    from: 'users',
                    localField: 'userid',
                    foreignField: '_id',
                    as: 'userData'
                }
            })
            pipeline.push({
                $unwind: { path: "$userData" }
            })
            let result = await withdrawalModel.aggregate(pipeline);

            if (result.length > 0) {
                let userWithdraw = result[0];
                let user = userWithdraw.userData;
                if (user.status != 'activated') {
                    return {
                        status: false,
                        message: 'user is blocked.'
                    }
                }
                if (user.user_verify.pan_verify != 1) {
                    return {
                        status: false,
                        message: 'Please first complete your PAN verification process to withdraw this amount.'
                    }
                }
                if (user.user_verify.bank_verify != 1) {
                    return {
                        status: false,
                        message: 'Please first complete your Bank verification process to withdraw this amount.'
                    }
                }

                try {

                    const payoutsInstance = new cashFree.Payouts({
                        env: 'PRODUCTION',
                        clientId: constant.CASHFREE_PAYOUT_CLIENT_ID,
                        clientSecret: constant.CASHFREE_PAYOUT_SECRETKEY,
                        pathToPublicKey: process.cwd() + '/public_key.pem'
                    });
                    let beneId = `${req.params.id}${user.bank.accno}`;
                    let beneficiaryData = {
                        beneId: beneId,
                        name: user.bank.accountholder,
                        email: user.email,
                        phone: user.mobile,
                        bankAccount: user.bank.accno,
                        ifsc: user.bank.ifsc,
                        address1: 'India',
                        city: '',
                        state: '',
                        pincode: '',
                    }
                    const response = await payoutsInstance.beneficiary.add(beneficiaryData);
                    const timestamp = Date.now();
                    let transferId = `${timestamp}${Math.floor(1000 + Math.random() * 9000)}`;
                    if (response.status == 'SUCCESS' && response.subCode == 200 || response.status == 'ERROR' && response.subCode == 409) {
                        let transferss = {
                            beneld: beneId,
                            amount: amount,
                            transferId: transferId,
                            remarks: 'Transfer request from Payout kit',
                            withdrawid: req.query.withdrawalId
                        }
                        await withdrawRequestModel.create(transferss);

                        const transferResult = await payoutsInstance.transfers.requestTransfer({
                            beneId: beneId,
                            amount: amount,
                            transferId: `${timestamp}${Math.floor(1000 + Math.random() * 9000)}`,
                        });
                        const updateWithdraw = await withdrawalModel.findOneAndUpdate({ _id: req.query.withdrawalId }, {
                            $set: {
                                approved_date: moment().format("YYYY-MM-DD"),
                                status: 3,
                                comment: "approved",
                                tranfer_id: transferId,
                                beneld: beneficiaryData.beneId
                            }
                        }, { new: true });
                        if (updateWithdraw) {
                            return {
                                status: true,
                                data: updateWithdraw.status
                            }
                        }
                    }

                } catch (error) {
                    console.log('error', error)
                    throw error;
                }
            } else {
                return {
                    status: false,
                    message: 'data is not available.'
                }
            }
        } catch (error) {
            console.log('error', error)
            throw error;
        }
    }
    async reject_withdraw_request(req) {
        try {
            const updateWithdraw = await withdrawalModel.findOneAndUpdate({ _id: req.query.withdrawalId }, { $set: { approved_date: moment().format("YYYY-MM-DD"), status: 2, comment: req.query.description } }, { new: true });
          

            if (updateWithdraw) {
                const returnAmount = await userModel.updateOne({ _id: req.query.userid }, {
                    $inc: {
                        'userbalance.winning': Number(req.query.amount)
                    }
                })
                console.log(returnAmount)
                if(returnAmount.modifiedCount > 0){
                    return {
                        status: true,
                        data: updateWithdraw.status
                    }
                } else {
                    return {
                        status: false,
                        message: 'Amount not add in wallet'
                    }
                }

            } else {
                return {
                    status: false,
                    data: 'rejection can not be proccess'
                }
            }
        } catch (error) {
            throw error;
        }
    }

}


module.exports = new verificationServices();