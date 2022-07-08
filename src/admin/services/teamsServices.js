const teamModel = require('../../models/teamModel');

class teamsServices{

    constructor(){
        return {
            editTeam:this.editTeam.bind(this),
            edit_Team_Data:this.edit_Team_Data.bind(this)
        }
    }

    async getTeamData(data){
        let result = await teamModel.find(data);
        return result;
    }

    async editTeam(req){
        let whereObj ={
            _id:req.params.id
        }
        let data = await this.getTeamData(whereObj);
        if(data.length > 0){
            return data[0];
        }
    }
    async edit_Team_Data(req){
        if(req.fileValidationError){
            return{
                status:false,
                message:req.fileValidationError
            }

        }
        let whereObj ={
            _id:req.params.id
        }
        let doc=req.body;
        delete doc.typename;
        if(req.file){
            doc.logo=`/teams/${req.file.filename}`
            let  uploadImg = await this.getTeamData(whereObj);
            console.log("uploadImg.....",uploadImg)
            if(uploadImg[0].logo){
                var fs = require('fs');
                var filePath = `public${uploadImg[0].logo}`;
                // console.log("bgggggg,",fs.existsSync(filePath))
                if(fs.existsSync(filePath) == true){
                    fs.unlinkSync(filePath)
                }
            }
        }
        const data=await teamModel.updateOne(whereObj,{$set:doc});
        if(data.modifiedCount == 1){
            return true;
        } 
    }

}
module.exports = new teamsServices()