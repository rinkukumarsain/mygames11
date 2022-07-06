const mongoose=require("mongoose");
const dashboardService=require("../services/dashbordService");

class dashboardController {
    constructor() {
        return {
           
            showdashboard: this.showdashboard.bind(this),
            totalAmountWithdrawInWeek:this.totalAmountWithdrawInWeek.bind(this),
            totalAmountReceivedInWeek:this.totalAmountReceivedInWeek.bind(this),
        }
    }
    async showdashboard(req, res, next) {
        try {
            res.locals.message = req.flash();
            console.log('admin data', req.session.data)
            const dashData=await dashboardService.dashbordData(req);
            res.render('dashboard', {
                sessiondata: req.session.data,dashData
            });
        } catch (error) {
            next(error);
        }
    }
    async totalAmountWithdrawInWeek(req,res,next){
        try{
            const tAmountDataW=await dashboardService.totalAmountWithdrawInWeek(req);
            res.send(tAmountDataW);

        }catch(error){
            next(error);
        }
    }
    async totalAmountReceivedInWeek(req,res,next){
        try{
            const tAmountDataR=await dashboardService.totalAmountReceivedInWeek(req);
            res.send(tAmountDataR);
        }catch(error){
            next(error)
        }
    }
}
module.exports = new dashboardController();