
const listMatchModel = require('../../models/listMatchesModel');
const userModel = require('../../models/userModel');
const teamModel = require('../../models/teamModel');
const challengersModel = require("../../models/challengersModel");
const playerModel=require("../../models/playerModel");
const withdrawModel = require('../../models/withdrawModel');
const seriesModel=require("../../models/addSeriesModel");
const paymentProcessModel=require("../../models/PaymentProcessModel");
const moment=require("moment");

class offerServices {
    constructor() {
        return {
            dashbordData: this.dashbordData.bind(this),
            totalAmountWithdrawInWeek:this.totalAmountWithdrawInWeek.bind(this),
            totalAmountReceivedInWeek:this.totalAmountReceivedInWeek.bind(this),
        }
    }
    // --------------------
    async dashbordData(req){
        try{
           // ------------match---------
           const allMatchLength=await listMatchModel.countDocuments();
           const launchMatchLength=await listMatchModel.countDocuments({launch_status:'launched'});
           const completeMatchLength=await listMatchModel.countDocuments({status:'completed'});
           const liveMatchLength=await listMatchModel.countDocuments({status:'started',launch_status:'launched'});
            // ------------Teams---------

            const allTeamsLength=await teamModel.countDocuments();
            const globelContestLength=await challengersModel.countDocuments();
            const allPlayerLength=await playerModel.countDocuments();

            const pendingBankRequests=await userModel.countDocuments({'user_verify.bank_verify':0});
            const VerifiedBankRequests=await userModel.countDocuments({'user_verify.bank_verify':1});
            const notUploadBankUserLength=await userModel.countDocuments({'user_verify.bank_verify':-1});

            const PendingWithdrawalRequest=await withdrawModel.countDocuments({status:0});
            const VerifiedWithdrawalRequest=await withdrawModel.countDocuments({status:1});
            const totalWithdrawAmount=await withdrawModel.countDocuments();

            const NoOfUserRegister=await userModel.countDocuments();
            const NoOfActiveUsers=await userModel.countDocuments({status:'activated'});
            const PendingWinnerDeclare=await seriesModel.countDocuments();

            const pendingPanRequests=await userModel.countDocuments({'user_verify.pan_verify':0});
            const notUploadedPanUsers=await userModel.countDocuments({'user_verify.pan_verify': -1});
            const verifiedPanRequests=await userModel.countDocuments({'user_verify.pan_verify':1})

            // console.log("allMatchLength,launchMatchLength,completeMatchLength,liveMatchLength///////////",allMatchLength,launchMatchLength,completeMatchLength,liveMatchLength,allTeamsLength,globelContestLength,allPlayerLength,pendingBankRequests,notUploadBankUserLength,VerifiedBankRequests,PendingWithdrawalRequest,VerifiedWithdrawalRequest,totalWithdrawAmount,NoOfUserRegister,NoOfActiveUsers,PendingWinnerDeclare,pendingPanRequests,notUploadedPanUsers,verifiedPanRequests)

            return{
                allMatchLength,launchMatchLength,completeMatchLength,liveMatchLength,allTeamsLength,globelContestLength,allPlayerLength,pendingBankRequests,notUploadBankUserLength,VerifiedBankRequests,PendingWithdrawalRequest,VerifiedWithdrawalRequest,totalWithdrawAmount,NoOfUserRegister,NoOfActiveUsers,PendingWinnerDeclare,pendingPanRequests,notUploadedPanUsers,verifiedPanRequests
            }

        }catch(error){
            console.log(error)
        }
    }
    async totalAmountWithdrawInWeek(req){
        try{
            var date = new Date();
            date.setDate(date.getDate() - 6);
           let lastDate=moment(date).format('YYYY-MM-DD')
            const getData=await withdrawModel.find({approved_date:{$gte:lastDate},status:1});
         
            // ------------
            let newObj={};
            while(date <= new Date()){
                let getDate = getData.reduce((acc, obj) => {
                            if (acc[moment(obj.approved_date).format("D MMM")]== undefined) {
                                acc[moment(obj.approved_date).format("D MMM")] = 0;
                            }
                            acc[moment(obj.approved_date).format("D MMM")] = acc[moment(obj.approved_date).format("D MMM")] + obj.amount
        
                            return acc;
                }, {});
                if(getDate[moment(date).format("D MMM")] == undefined){
                    newObj[moment(date).format("D MMM")]=0
                }else{
                    newObj[moment(date).format("D MMM")]=getDate[moment(date).format("D MMM")]
                }
                date.setDate(date.getDate() + 1);
            }
            
                let totalAmount=0;
                for(let vals of Object.values(newObj)){
                    totalAmount = totalAmount + vals
                }
                return [Object.keys(newObj),Object.values(newObj),totalAmount]
           

        }catch(error){
            console.log(error)
        }
    }
    async totalAmountReceivedInWeek(req){
        try{
            var date = new Date();
            date.setDate(date.getDate() - 6);
           let lastDate=moment(date).format('YYYY-MM-DD')
            const getData=await paymentProcessModel.find({createdAt:{$gte:lastDate},status:'success'});
 
            // ------------
            let newObj={};
            while(date <= new Date()){
                let getDate = getData.reduce((acc, obj) => {
                            if (acc[moment(obj.createdAt).format("D MMM")]== undefined) {
                                acc[moment(obj.createdAt).format("D MMM")] = 0;
                            }
                            acc[moment(obj.createdAt).format("D MMM")] = acc[moment(obj.createdAt).format("D MMM")] + obj.amount
        
                            return acc;
                }, {});
                if(getDate[moment(date).format("D MMM")] == undefined){
                    newObj[moment(date).format("D MMM")]=0
                }else{
                    newObj[moment(date).format("D MMM")]=getDate[moment(date).format("D MMM")]
                }
                date.setDate(date.getDate() + 1);
            }
            console.log("newObj..",newObj)
            
                let totalAmount=0;
                for(let vals of Object.values(newObj)){
                    totalAmount = totalAmount + vals
                }
                return [Object.keys(newObj),Object.values(newObj),totalAmount]

        }catch(error){
            console.log(error)
        }
    }
    
}
module.exports = new offerServices();