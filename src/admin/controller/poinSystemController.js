const pointSystemServices = require('../services/pointSystemService');
const mongoose=require("mongoose");


class pointController {
    constructor() {
        return {
            pointSystem:this.pointSystem.bind(this),
            updatePointSystem:this.updatePointSystem.bind(this),
            
        }
    }
   async pointSystem(req,res,next){
       try{
        const pointSystemData=await pointSystemServices.pointSystemzero(req);
        console.log("pointSystemData...................",pointSystemData)
        let data,data2,data3,data4,data5,data6
        if(pointSystemData.length >0){
            data=pointSystemData[0]
            data2=pointSystemData[1]
            data3=pointSystemData[2]
            data4=pointSystemData[3]
            data5=pointSystemData[4]
            data6=pointSystemData[5]
            console.log("data...........0....",data)
            res.render("pointSystem/pointSystem",{ sessiondata: req.session.data, data,data2,data3,data4,data5,data6});

        }else{
            data,data2,data3,data4,data5,data6=undefined;
            res.render("pointSystem/pointSystem",{ sessiondata: req.session.data, data,data2,data3,data4,data5,data6});
        }

       }catch(error){
            // next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/");
       }
   }
   async updatePointSystem(req,res,next){
       try{
           const updatPoint=await pointSystemServices.updatePointSystem(req);
           if(updatPoint.status == true){
               console.log('pointsystem point update')
               return true;
           }else if(updatPoint.status == false){
               console.log(updatPoint.message)
               return false;
           }

       }catch(error){
            // next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/pointSystem");
       }
   }

}
module.exports = new pointController();