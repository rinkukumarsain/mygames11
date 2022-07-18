const mongoose = require('mongoose');
const moment=require("moment");
const seriesModel=require("../../models/addSeriesModel");
const adminModel=require("../../models/adminModel");
const seriesPricecardModel=require("../../models/seriesPriceCardModel");
class leaderboardServices {
    constructor() {
        return {
            viewLeaderBoarderPage: this.viewLeaderBoarderPage.bind(this),
            addSeriesPriceCardPage:this.addSeriesPriceCardPage.bind(this),
            addSeriesPriceCardData:this.addSeriesPriceCardData.bind(this),
            deleteSeriesPriceCard:this.deleteSeriesPriceCard.bind(this),
            distributeWinningAmountSeriesLeaderboard:this.distributeWinningAmountSeriesLeaderboard.bind(this),
        }
    }
    // --------------------
   async viewLeaderBoarderPage(req){
    try{

        const seriesData=await seriesModel.find();
        return seriesData;
        

    }catch(error){
        console.log(error)
    }
   }
   async addSeriesPriceCardPage(req){
    try{
        console.log("req...",req.params)
        if (req.params) {
            const series_Data = await seriesModel.findOne({ _id: mongoose.Types.ObjectId(req.params.id), is_deleted: false });
            if (series_Data) {
                    const check_PriceCard = await seriesPricecardModel.find({ seriesId: mongoose.Types.ObjectId(req.params.id), is_deleted: false });
                    // console.log("check_PriceCard.....", check_PriceCard);
                    let totalAmountForPercentage = 0;

                    if (check_PriceCard.length == 0) {
                        let position = 0;
                        return {
                            status: true,
                            series_Data,
                            position,
                            totalAmountForPercentage,
                        }
                    } else {
                        let lastIndexObject = (check_PriceCard.length) - 1;
                        let lastObject = check_PriceCard[lastIndexObject];
                        let position = lastObject.max_position
                        for (let key of check_PriceCard) {
                                totalAmountForPercentage = totalAmountForPercentage + key.total
                        }
                        return {
                            status: true,
                            series_Data,
                            position,
                            check_PriceCard,
                            totalAmountForPercentage
                        }
                    }
            } else {
                return {
                    status: false,
                    message: 'series not found..'
                }
            }

        } else {
            return {
                status: false,
                message: 'Invalid request Id'
            }
        }
    }catch(error){
        console.log(error)
    }
   }
   async addSeriesPriceCardData(req){
    try{
        const series_Data = await seriesModel.findOne({ _id: req.body.seriesId });
        const check_PriceCard = await seriesPricecardModel.find({ seriesId: req.body.seriesId });

        if (req.body.min_position && req.body.winners && req.body.price) {
            if (Number(req.body.winners) == 0 || Number(req.body.price) == 0) {
                return {
                    status: false,
                    message: 'winners or price can not equal to Zero'
                }
            }
            if (check_PriceCard.length == 0) {
                   
                    const insertPriceData = new seriesPricecardModel({
                        seriesId: mongoose.Types.ObjectId(req.body.seriesId),
                        winners: Number(req.body.winners),
                        price: Number(req.body.price),
                        min_position: Number(req.body.min_position),
                        max_position: (Math.abs((Number(req.body.min_position)) - (Number(req.body.winners)))).toFixed(2),
                        total: ((Number(req.body.winners)) * (Number(req.body.price))).toFixed(2),
                        type: 'Amount',
                    })
                    let savePriceData = await insertPriceData.save();
                    if (savePriceData) {
                        return {
                            status: true,
                            message: 'price Card added successfully'
                        };
                    }
                }else {

                let lastIndexObject = (check_PriceCard.length) - 1;
                let lastObject = check_PriceCard[lastIndexObject];
                let position = lastObject.max_position

                let totalAmountC = 0;
                for (let key of check_PriceCard) {
                        totalAmountC = totalAmountC + key.total
                    
                }
                    const insertPriceData = new seriesPricecardModel({
                        seriesId: mongoose.Types.ObjectId(req.body.seriesId),
                        winners: Number(req.body.winners),
                        price: Number(req.body.price),
                        min_position: position,
                        max_position: ((Number(req.body.min_position)) + (Number(req.body.winners))),
                        total: ((Number(req.body.winners)) * (Number(req.body.price))).toFixed(2),
                        type: 'Amount',
                    })
                    let savePriceData = await insertPriceData.save();
                    if (savePriceData) {
                        return {
                            status: true,
                            message: 'price Card added successfully'
                        };
                    }
                }
                }
    }catch(error){
        console.log(error)
    }
   }
   async deleteSeriesPriceCard(req){
    try {
        const deletequery = await seriesPricecardModel.deleteOne({ _id: req.params.id });
        if (deletequery.deletedCount > 0) {
            return {
                status: true,
                message: 'delete successfully'
            }
        } else  {
            return {
                status: false,
                message: 'unable to delete'
            }
        }

    } catch (error) {
        throw error;
    }
   }
   async distributeWinningAmountSeriesLeaderboard(req){
    try{
        let adminData=req.session.data;
        console.log("req.session.data.............",req.session.data)
        let chekMater=await adminModel.findOne({_id:mongoose.Types.ObjectId(adminData._id),masterpassword:req.body.masterpassword});
        if(chekMater){
            return{
                status:true,
            }
        }else{
            return{
                status:false,
                message:'wrong master password..'
            }
        }

    }catch(error){
        console.log(error)
    }
   }

}
module.exports = new leaderboardServices();