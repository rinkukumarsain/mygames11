const mongoose = require('mongoose');
const randomstring = require("randomstring");
const moment=require("moment");
const adminModel=require("../../models/adminModel");
const offerModel=require("../../models/offerModel");
const res = require('express/lib/response');

class offerServices {
    constructor() {
        return {
            addOfferData: this.addOfferData.bind(this),
            editoffers_page:this.editoffers_page.bind(this),
            editOfferData:this.editOfferData.bind(this),
            deleteoffers:this.deleteoffers.bind(this),
        }
    }
    // --------------------
    async addOfferData(req){
        try{
            // console.log("req.body addoferrr....",req.body); 
            // console.log(moment(moment(req.body.start_date).format('DD-MM-YYYY'), 'DD-MM-YYYY').isBefore(moment(moment(req.body.expire_date).format('DD-MM-YYYY'), 'DD-MM-YYYY')));
            if(Number(req.body.max_amount) < Number(req.body.min_amount)){
                return {
                    message: "please add maximum amount less then minimum amount",
                    status: false
                };
            }else if (moment(moment(req.body.start_date).format('DD-MM-YYYY'), 'DD-MM-YYYY').isBefore(moment(moment(req.body.expire_date).format('DD-MM-YYYY'), 'DD-MM-YYYY')) === false) {
                return {
                    message: "please select a expire date after start date",
                    status: false
                };
            } else {
                let whereOfferCode={
                    offer_code:req.body.offercode
                }
                const checkOfferCode=await offerModel.find(whereOfferCode);
                console.log("checkOfferCode",checkOfferCode)
                if(checkOfferCode.length > 0){
                    return {
                        message: "offer Code Already excess",
                        status: false
                    };
                }else{
                    const insertOffer=new offerModel({
                        min_amount:req.body.min_amount,
                        max_amount:req.body.max_amount,
                        bonus:req.body.bonus,
                        offer_code:req.body.offercode,
                        type:req.body.bonus_type,
                        bonus_type:req.body.bonus_type,
                        title:req.body.title,
                        start_date:moment(req.body.start_date).format('YYYY-MM-DD HH:mm'),
                        expire_date:moment(req.body.expire_date).format('YYYY-MM-DD HH:mm'),
                        user_time:req.body.user_time,
                        amt_limit:req.body.amt_limit,
                        description:req.body.description,
                    })
                    let saveOffer=insertOffer.save();
                    if(saveOffer){
                        return true;
                    }
                }

            }       

        }catch(error){
            console.log(error)
        }
    }
    async editoffers_page(req){
        try{
            let whereObj={}
            if(req.query.offerId){
                whereObj._id=req.query.offerId
            }else{
                whereObj._id=req.body.offerId
            }
            // console.log("whereObj..........",whereObj)
            const getOfferData=await offerModel.find(whereObj);
            if(getOfferData){
                return getOfferData;
            }else{
                throw error;
            }

        }catch(error){
            throw error;
        }
    }
    async editOfferData(req){
        try{
            console.log("i am edit oferrr.......................................");
            const fineOffer=await offerModel.findOne({_id:req.body.offerId});
            console.log("fineOffer.......................",fineOffer)
            if(Number(req.body.max_amount) < Number(req.body.min_amount)){
                return {
                    message: "please add maximum amount less then minimum amount",
                    status: false,
                    data:fineOffer
                };
            }else if (moment(moment(req.body.start_date).format('DD-MM-YYYY'), 'DD-MM-YYYY').isBefore(moment(moment(req.body.expire_date).format('DD-MM-YYYY'), 'DD-MM-YYYY')) === false) {
                return {
                    message: "please select a expire date after start date",
                    status: false,
                    data:fineOffer
                };
            } else {
                    const updateOffer=await offerModel.updateOne({_id:req.body.offerId},{
                        $set:{
                            min_amount:req.body.min_amount,
                            max_amount:req.body.max_amount,
                            bonus:req.body.bonus,
                            offer_code:req.body.offercode,
                            type:req.body.bonus_type,
                            bonus_type:req.body.bonus_type,
                            title:req.body.title,
                            start_date:moment(req.body.start_date).format('YYYY-MM-DD HH:mm'),
                            expire_date:moment(req.body.expire_date).format('YYYY-MM-DD HH:mm'),
                            user_time:req.body.user_time,
                            amt_limit:req.body.amt_limit,
                            description:req.body.description,
                        }
                    })
                    console.log("updateOffer........",updateOffer)
                    if(updateOffer.modifiedCount==1){
                        return true;
                    }
                
            } 


        }catch(error){
            throw error;
        }
    }
    async deleteoffers(req){
        try{
            const deleteOffer=await offerModel.deleteOne({_id:req.query.offerId});
            if(deleteOffer){
                return true;
            }

        }catch(error){
            throw error;
        }
    }


}
module.exports = new offerServices();