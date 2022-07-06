const res = require('express/lib/response');
const mongoose = require('mongoose');
const randomstring = require("randomstring");

const adminModel=require("../../models/adminModel");

class offerServices {
    constructor() {
        return {
            getPointToDb:this.getPointToDb.bind(this),
            updatePoint:this.updatePoint.bind(this),
        }
    }
    // --------------------
    async updatePoint(req){
        try{
            let doc={updation_points:req.body.updation_points}

            const updatePoint=await adminModel.updateOne({role:0},{
                $set:{
                    androidversion:doc
                }
            });
            // console.log("updatePoint........",updatePoint);
            if(updatePoint.modifiedCount == 1){
                    return true;
            }


        }catch(error){
            throw error;
        }
    }
    async getPointToDb(req){
        try{
            const getPointData=await adminModel.findOne({role:0});
            console.log("getPointData.......",getPointData)
            if(getPointData){
                let data=getPointData.androidversion.updation_points
                return data
            }

        }catch(error){
            throw error;
        }
    }
  


}
module.exports = new offerServices();