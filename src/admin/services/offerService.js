const mongoose = require('mongoose');
const randomstring = require("randomstring");
let fs = require('fs');
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
          
                let whereOfferCode={
                    offer_code:req.body.offercode
                }
                const checkOfferCode=await offerModel.find(whereOfferCode);
                if(checkOfferCode.length > 0){
                    return {
                        message: "offer Code Already exist",
                        status: false
                    };
                }else{
                    let obj={
                        max_amount:req.body.max_amount,
                        bonus:req.body.bonus,
                        offer_code:req.body.offercode,
                        type:req.body.bonus_type,
                        bonus_type:req.body.bonus_type,
                        title:req.body.title,
                        user_time:req.body.user_time,
                    }
                    const insertOffer=new offerModel(obj)
                    let saveOffer=insertOffer.save();
                    if(saveOffer){
                        return {
                            status:true,
                            message:'offer add successfully'
                        };
                    }
                }

                
        
        }catch(error){
            let filePath = `public/${req.body.typename}/${req.file.filename}`;
          if (fs.existsSync(filePath) == true) {
                            fs.unlinkSync(filePath);
                        }
            
            throw error
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
            if(req.fileValidationError){
                return{
                    status:false,
                    message:req.fileValidationError
                }

            }else{
           
                let obj={
                    max_amount:req.body.max_amount,
                    bonus:req.body.bonus,
                    offer_code:req.body.offercode,
                    type:req.body.bonus_type,
                    bonus_type:req.body.bonus_type,
                    title:req.body.title,
                    user_time:req.body.user_time,
                }

                const find=await offerModel.find({_id:{$ne:req.body.offerId}, offer_code:req.body.offercode,});
                if(find.length>0){
                    return{
                        status:false,
                        message:'offer code already exist'
                    }
                }
                  
                    const updateOffer=await offerModel.updateOne({_id:req.body.offerId},{
                        $set:obj
                    })
                    if(updateOffer.modifiedCount > 0){
                        return {
                            status:true,
                            message:'offer successfully update'
                        };
                    }else{
                       
                        return {
                            status:false,
                            message:'offer can not update -- error'
                        };
                    }
                
            

        }
        }catch(error){
            throw error;
        }
    }
    async deleteoffers(req){
        try{
            const deleteOffer=await offerModel.deleteOne({_id:req.query.offerId});
            if(deleteOffer.deletedCount > 0 ){
                return {
                    status:true,
                    message:'offer deleted successfully'
                };
            }else{
                return {
                    status:false,
                    message:'offer can not delete --error'
                }
            }

        }catch(error){
            throw error;
        }
    }


}
module.exports = new offerServices();