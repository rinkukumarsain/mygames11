const userModel = require('../../models/userModel');
const withdrawalModel = require('../../models/withdrawModel');
const constant = require('../../config/const_credential');
const moment = require("moment");

const GetBouns = require('../../utils/getBonus');
const userServicesAPI = require('../../api/services/userServices')
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
            const panBonus = await new GetBouns().getBonus(constant.BONUS_TYPES.PAN_BONUS, constant.PROFILE_VERIFY_PAN_BANK.SUBMITED);
            console.log(`panCredentials-------${req.body.userid}-------here`, panBonus);

            let abc = await userServicesAPI.givebonusToUser(
                panBonus,
                req.body.userid,
                constant.PROFILE_VERIFY_BONUS_TYPES.PAN_BONUS,
                constant.USER_VERIFY_TYPES.PAN_VERIFY
            );
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
            const bankBonus = await new GetBouns().getBonus(constant.BONUS_TYPES.BANK_BONUS, constant.PROFILE_VERIFY_PAN_BANK.SUBMITED);

            await userServicesAPI.givebonusToUser(
                bankBonus,
                req.body.userid,
                constant.PROFILE_VERIFY_BONUS_TYPES.BANK_BONUS,
                constant.USER_VERIFY_TYPES.BANK_VERIFY
            );
            const bankCredentials = await userModel.findOneAndUpdate({ _id: req.body.userid }, { $set: { 'bank.status': req.body.bankstatus, 'user_verify.bank_verify': req.body.bankstatus, 'bank.comment': req.body.comment || '' } }, { new: true });
            if (!bankCredentials) {
                return {
                    status: false
                }
            } else {
                return {
                    status: true,
                    data: bankCredentials,
                }
            }
        } catch (error) {
            throw error;
        }
    }

    async approve_withdraw_request(req) {
        try {
            const findUserAmount = await userModel.findOne({ _id: req.params.id });
            const amount = Number(req.query.amount);
            const userAmount = findUserAmount.withdrawamount;
            const newAmount = amount + userAmount;
            const updateUserAmount = await userModel.findOneAndUpdate({ _id: req.params.id }, { $set: { withdrawamount: newAmount } }, { new: true });
            const updateWithdraw = await withdrawalModel.findOneAndUpdate({ _id: req.query.withdrawalId }, { $set: { approved_date: moment().format("YYYY-MM-DD"), status: 1, comment: "approved" } }, { new: true });
            if (updateWithdraw) {
                return {
                    status: true,
                    data: updateWithdraw.status
                }
            }
        } catch (error) {
            throw error;
        }
    }
    async reject_withdraw_request(req) {
        try {
            const updateWithdraw = await withdrawalModel.findOneAndUpdate({ _id: req.query.withdrawalId }, { $set: { approved_date: moment().format("YYYY-MM-DD"), status: 2, comment: req.query.description } }, { new: true });
            if (updateWithdraw) {
                return {
                    status: true,
                    data: updateWithdraw.status
                }
            }
        } catch (error) {
            throw error;
        }
    }

}


module.exports = new verificationServices();