const pointServices = require('../services/pointService');
const mongoose=require("mongoose");
const paymentprocessModel=require("../../models/PaymentProcessModel");
const moment=require("moment");
class receivefundController {
    constructor() {
        return {
            viewallReceiveFund:this.viewallReceiveFund.bind(this),
            viewAllReceiveFundDatatable:this.viewAllReceiveFundDatatable.bind(this),
            
        }
    }
    async viewallReceiveFund(req,res,next){
        try{
            res.locals.message = req.flash();
            let data={};
            if(req.query.paymentmethod){
                data.paymentmethod=req.query.paymentmethod
            }
            res.render("receiveFund/viewAllReceiveFund",{ sessiondata: req.session.data, data});

        }catch(error){
            console.log(error)
            req.flash('error','Something went wrong please try again');
            res.redirect("/");
        }
    }
    async viewAllReceiveFundDatatable(req,res,next){
        try{
            let limit1 = req.query.length;
            let start = req.query.start;
            // let conditions = {};
            
            // if (req.query.paymentmethod) {
            //     conditions.paymentmethod = req.query.paymentmethod
            // }else{
            //     conditions.paymentmethod = 'TEST'
            // }
            let condition = [];
                condition.push({
                    $match: {
                        status:'success' ,
                    },
                });
            condition.push({
              $lookup:{
                from: 'users',
                localField: 'userid',
                foreignField: '_id',
                as: 'result'
              },
            });
            condition.push({
                $unwind:{
                    path: '$result'
                  },
            });
            if (req.query.paymentmethod) {
                condition.push({
                    $match: {
                        paymentmethod:req.query.paymentmethod ,
                    },
                });
            }
            console.log("condition.........",condition);
      
                paymentprocessModel.countDocuments(condition).exec((err, rows) => {
                    console.log("rrrrrrrrrow..........",rows)
                let totalFiltered = rows;
                let data = [];
                let count = 1;
                paymentprocessModel.aggregate(condition).exec((err, rows1) => {
                    console.log('--------rows1------------------------------------------------', rows1);
                    if (err) console.log(err);
                    rows1.forEach((index) => {
                        let updatedAt_format = moment(index.updatedAt).format('dddd, DD-MMM-YYYY, h:mm:ss a');
                        console.log("updatedAt_format.......",updatedAt_format);
                        let updatedAt = `<div class="text-center"><span class="font-weight-bold text-success">${updatedAt_format.split(',')[0]},</span><br>
                        <span class="font-weight-bold text-primary">${updatedAt_format.split(',')[1]}</span><br>
                        <span class="font-weight-bold text-danger">${updatedAt_format.split(',')[2]}</span></div>`
                       
                        data.push({
                            "count": count,
                            "user_name": index.result?.username,
                            "mobile":index.result?.mobile,
                            "transaction_method": index.paymentmethod,
                            "transaction_date": updatedAt,
                            "transaction_amount":index.amount
                        });
                        count++;

                        if (count > rows1.length) {
                            // console.log(`data------SERVICES---------`, data);
                            let json_data = JSON.stringify({
                                "recordsTotal": rows,
                                "recordsFiltered": totalFiltered,
                                "data": data
                            });
                            res.send(json_data);
                        }
                    });
                });
            });

        }catch(error){
            next(error);
        }
    }
   
}
module.exports = new receivefundController();