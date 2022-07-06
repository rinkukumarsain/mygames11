const res = require('express/lib/response');
const mongoose = require('mongoose');
const randomstring = require("randomstring");
const { where } = require('../../models/pointSystemModel');

const pointSystemModel=require("../../models/pointSystemModel");

class offerServices {
    constructor() {
        return {
            updatePointSystem:this.updatePointSystem.bind(this),
            pointSystemzero:this.pointSystemzero.bind(this),
        }
    }
    // --------------------
    async pointSystemzero(req){
        try{
            

            const findOd=await pointSystemModel.find({format:'od'});
            console.log("findOd........",findOd);
            if(findOd.length == 0){
                let obj={
                    batting:{run:'0'}
                }
                const insertPointSystem=new pointSystemModel({
                    format:'od',
                    type:obj
                }).save();
            }
            const findother_od=await pointSystemModel.find({format:'other od'});
            if(findother_od.length == 0){
                let obj={
                    batting:{run:'0'}
                }
                const insertPointSystem=new pointSystemModel({
                    format:'other od',
                    type:obj
                }).save();
            }
            const findother_t20=await pointSystemModel.find({format:'other t20'});
            if(findother_t20.length == 0){
                let obj={
                    batting:{run:'0'}
                }
                const insertPointSystem=new pointSystemModel({
                    format:'other t20',
                    type:obj
                }).save();
            }
            const findt10=await pointSystemModel.find({format:'t10'});
            if(findt10.length == 0){
                let obj={
                    batting:{run:'0'}
                }
                const insertPointSystem=new pointSystemModel({
                    format:'t10',
                    type:obj
                }).save();
            }
            const findt20=await pointSystemModel.find({format:'t20'});
            if(findt20.length == 0){
                let obj={
                    economy_rate:{below_2_or_4_or_6_runs_per_over:'0'}
                }
                const insertPointSystem=new pointSystemModel({
                    format:'t20',
                    type:obj
                }).save();
            }
            const findtest=await pointSystemModel.find({format:'test'});
            if(findtest.length == 0){
                let obj={
                    batting:{run:'0'}
                }
                const insertPointSystem=new pointSystemModel({
                    format:'test',
                    type:obj
                }).save();
            }
            const getPointData=await pointSystemModel.find();
            console.log("getPointData........",getPointData)
            let arrayOne
            let arrayTwo
            let arrayThree
            let arrayFour
            let arrayFive
            let arraySix
            for await (let key of getPointData){
                if(key.format == 'od'){
                    arrayOne=key.type
                }
                if(key.format == 'other od'){
                    arrayTwo=key.type
                }
                if(key.format == 'other t20'){
                    arrayThree=key.type
                }
                if(key.format == 't10'){
                    arrayFour=key.type
                }
                if(key.format == 't20'){
                    arrayFive=key.type
                }
                if(key.format == 'test'){
                    arraySix=key.type
                }
            }
            return  [arrayOne,arrayTwo,arrayThree,arrayFour,arrayFive,arraySix] ;
            
            
        }catch(error){
            throw error;
        }
    }


    async updatePointSystem(req){
        try{
            var type=req.body.type;
            let field=req.body.field;
            let point=req.body.point;
            
            let obj={
                [type]:{[field]:req.body.point}
            }
            const checkFormat=await pointSystemModel.find({format:req.body.format});
            if(checkFormat.length == 0){
                const insertPointSystem=new pointSystemModel({
                    format:req.body.format,
                    type:obj
                })

                let savePointSystem=await insertPointSystem.save();
              
            } else {      
                let pointValue=checkFormat[0]['type'][`${req.body.type}`];
                // console.log("pointValue..........................",pointValue);
                if(!pointValue){
                    let typess=checkFormat[0].type;
                    typess[type]={[field]:req.body.point};
                    // console.log("typess.............",typess);
                   const updateNewObj=await pointSystemModel.updateOne({format:req.body.format},{
                       $set:{
                           'type':typess
                       }
                   })
                }else{
                let whereObj = {};
                whereObj[`format`] = req.body.format;
                whereObj[`type.${type}.${field}`] = '0'
                const checkfield=await pointSystemModel.find(whereObj);
                if(checkfield.length == 0){
                    console.log("checkfield.length == 0")
                    const getPoint=await pointSystemModel.find({format:req.body.format});
                    let pointValue=getPoint[0]['type'][`${req.body.type}`][`${req.body.field}`];
                    let whereObj3={}
                    whereObj3[`format`] = req.body.format;
                    whereObj3[`type.${type}.${field}`] = pointValue
                    let whereObj2={};
                    whereObj2[`type.${type}.${field}`] = point
                    const updateField=await pointSystemModel.updateOne(whereObj3,{
                        $set:whereObj2
                    })
                    if(updateField.modifiedCount == 1){
                        return {
                            status:true,
                        }
                    }else{
                        return {
                            status:false,
                            message:'point system can not update'
                        }
                    }
                }
                else{
                    console.log("checkfield.length more then 0/////////////////////")
                    let whereObj2={};
                    whereObj2[`type.${type}.${field}`] = point
                    const updateField=await pointSystemModel.updateOne(whereObj,{
                        $set:whereObj2
                    })
                    if(updateField.modifiedCount == 1){
                        return {
                            status:true,
                        }
                    }else{
                        return {
                            status:false,
                            message:'point system can not update'
                        }
                    }
                }
                }

               
            }


        }catch(error){
            throw error;
        }
    }


}
module.exports = new offerServices();
