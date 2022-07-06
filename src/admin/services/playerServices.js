
const res = require('express/lib/response');
const mongoose = require('mongoose');
const teamModel = require('../../models/teamModel');
const playerModel = require("../../models/playerModel");
const fs = require('fs');
class playersServices {
    constructor() {
        return {
            viewAllPlayer: this.viewAllPlayer.bind(this),
            edit_player: this.edit_player.bind(this),
            edit_player_data: this.edit_player_data.bind(this),
            saveplayerroles:this.saveplayerroles.bind(this),
        }
    }
    // --------------------
    async viewAllPlayer(req) {
        try {
            const getTeamName = await teamModel.find({}, { teamName: 1 });
            if (getTeamName) {
                return {
                    status: true,
                    teamName: getTeamName
                }
            } else {
                return {
                    status: false,
                    message: 'Team data not found'
                }
            }

        } catch (error) {
            throw error;
        }
    }
    async edit_player(req) {
        try {
            const getPlayerData = await playerModel.findOne({ _id: req.params.playerId });
            console.log()
            if (getPlayerData) {
                return {
                    status: true,
                    playerdata: getPlayerData
                }

            } else {
                return {
                    status: false,
                    message: 'Invalid player found..'
                }
            }

        } catch (error) {
            throw error;
        }
    }
    async edit_player_data(req) {
        try {
            console.log("req.body...........",req.body)
            let whereIs = {
                is_deleted: false,
                _id: mongoose.Types.ObjectId(req.params.playerId)
            }
            const checkPlayerData = await playerModel.findOne(whereIs);
                    
            if (checkPlayerData) {
                if (req.file) {
                    if (checkPlayerData.image) {
                        var filePath = `public${(checkPlayerData.image)}`;
                        console.log("filePath............",filePath)
                        if(fs.existsSync(filePath) == true){
                            fs.unlinkSync(filePath);
                        }
                    }
                }
                let doc=req.body
                if(req.file){
                   doc.image=`/${req.body.typename}/${req.file.filename}`
                }
                console.log("doc is..................0",doc)
                const updatePlayerData = await playerModel.updateOne(whereIs,{
                    $set:doc
                });
                console.log("updatePlayerData..................",updatePlayerData)
                if(updatePlayerData.modifiedCount == 1){
                    return{
                        status:true,
                        message:'player data successfully update'
                    }
                }else{
                    return{
                        status:false,
                        message:'player data con not update --error--'
                    }
                }
            } else {
                return {
                    status: false,
                    message: 'Invalid player Id ..'
                }
            }


        } catch (error) {
            throw error;
        }
    }
    async saveplayerroles(req){
        try{
            const checkCradits=await playerModel.findOne({_id:mongoose.Types.ObjectId(req.body.id)});
            if(checkCradits){
                const updateCradits=await playerModel.updateOne({_id:mongoose.Types.ObjectId(req.body.id)},{
                    $set:{
                        credit:req.body.credit,
                    }
                })
                if(updateCradits.modifiedCount == 1){
                    return{
                        status:true,
                        message:'credit successfully update'
                    }
                }else{
                    return{
                        status:false,
                        message:'credit not updated ..error..'
                    }
                }

            }else{
                return {
                    status:false,
                    message:'id not found..error..'
                }
            }

        }catch(error){
            throw error;
        }
    }



}
module.exports = new playersServices();