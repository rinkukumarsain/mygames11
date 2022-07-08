const mongoose = require('mongoose');
const moment = require("moment");
const fs = require('fs');
const config=require("../../config/const_credential");

const listMatchModel = require('../../models/listMatchesModel');
const matchPlayersModel = require('../../models/matchPlayersModel');
const teamModel = require('../../models/teamModel');
const seriesModel=require("../../models/addSeriesModel");
const seriesServices = require('./seriesServices');
const playerModel=require("../../models/playerModel");
const { generateKey } = require('crypto');
class matchServices {
    constructor() {
        return {
            updateStatusforSeries: this.updateStatusforSeries.bind(this),
            addMatchPage:this.addMatchPage.bind(this),
            addMatchData:this.addMatchData.bind(this),
            edit_Match: this.edit_Match.bind(this),
            edit_match_data: this.edit_match_data.bind(this),
            launch_Match: this.launch_Match.bind(this),
            launch: this.launch.bind(this),
            launchMatchChangeTeamLogo: this.launchMatchChangeTeamLogo.bind(this),
            findMatchPlayers: this.findMatchPlayers.bind(this),
            updateTeam1Playing11: this.updateTeam1Playing11.bind(this),
            updateTeam2Playing11: this.updateTeam2Playing11.bind(this),
            updatePlaying11Launch: this.updatePlaying11Launch.bind(this),
            launchMatchPlayerUpdateData:this.launchMatchPlayerUpdateData.bind(this),
            matchPlayerDelete:this.matchPlayerDelete.bind(this),
            unlaunchMatch:this.unlaunchMatch.bind(this),
        }
    }

    async findMatch(data) {
        let result = await listMatchModel.find(data);
        return result;
    }

    async updateStatusforSeries(req) {
        try {
            // console.log('id',req.params.id);
            // console.log('id',req.query.status);
            let data = await listMatchModel.updateOne({
                _id: req.params.id
            }, {
                $set: {
                    status: req.query.status
                }
            });
            console.log('data-services', data.modifiedCount);
            if (data.modifiedCount == 1) {
                return true;
            }
        } catch (error) {
            throw error;
        }
    }

    async addMatchPage(req){
        try{
         const teamData=await teamModel.find();
         const seriesData=await seriesModel.find();
            console.log("teamData,,",teamData,"seriesData...",seriesData)
         return {teamData,seriesData};

        }catch(error){
            console.log(error);
            req.flash("error",'something wrong please try again letter');
            res.redirect('/');
        }
    }

    async addMatchData(req){
        try{
            if((req.body.team1Id).toString() == (req.body.team2Id).toString()){
                return{
                    status:false,
                    message:'please select different teams'
                }
            }
            async function generateKey(){
                let rNum=Math.floor(10000 + Math.random() * 90000);
                let checkMatchKey=await listMatchModel.findOne({real_matchkey:rNum});
                if(checkMatchKey){
                    generateKey();
                }
                return rNum;
            }
            
            var data=req.body;
            let nn=await generateKey();
            data.real_matchkey=nn;
            data.start_date = moment(new Date(req.body.start_date)).format('YYYY-MM-DD HH:mm:ss');
            data.team1Id=req.body.team1Id;
            data.team1Id=req.body.team2Id;
            data.series=req.body.series;
            data.short_name=req.body.name;
            data.status='notstart'
            data.launch_status='panding'
            data.final_status='panding'
            data.squadstatus='YES'
            console.log("data....",data)
            let whereObj = {
                is_deleted: false,
                name: req.body.name,
            }
            const checkName = await this.findMatch(whereObj);
            if (checkName.length > 0) {
                return {
                    message: "series Name already exist...",
                    status: false,
                };
            } else {
                let datainsert =new listMatchModel(data);
                let saveMatch=await datainsert.save();
                if (saveMatch) {
                    return {status:true,message:'match add successfully'};
                }else{
                    return {status:false,message:'match can not add..something wrong'};
                }
            }

        }catch(error){
            throw error;
        }
    }

    async edit_Match(req) {
        try {
            let whereObj = {
                is_deleted: false,
                _id: req.params.id
            };
            let data = await this.findMatch(whereObj);
            let team1name = await teamModel.findOne({
                _id: data[0]?.team1Id
            });
            let team2name = await teamModel.findOne({
                _id: data[0]?.team2Id
            });
            // console.log('team1name.teamName', team1name)
            let whereObjSeries = {
                status: 'opened',
                end_date: {
                    $gte: moment().format("YYYY-MM-DD HH:mm:ss")
                }
            }
            // console.log('whereObjSeries-------------', whereObjSeries)
            let seriesData = await seriesServices.findSeries(whereObjSeries);
            // console.log('seriesData-------------', seriesData)
            let finalObj = {};
            finalObj._id = data[0]._id;
            finalObj.name = data[0].name;
            finalObj.start_date = data[0].start_date;
            finalObj.real_matchkey = data[0].real_matchkey;
            finalObj.format = data[0].format;
            finalObj.team1Name = team1name.teamName;
            finalObj.team2Name = team2name.teamName;
            finalObj.Series = seriesData;
            finalObj.seriesId = data[0].series;
            // console.log('team2name.teamName........................................', finalObj)
            if (data.length > 0) {
                return finalObj;
            }
        } catch (error) {
            throw error;
        }
    }

    async edit_match_data(req) {
        try {
            let {
                start_date
            } = req.body
            req.body.start_date = moment(start_date).format('YYYY-MM-DD HH:mm:ss');

            let whereObj = {
                is_deleted: false,
                _id: {
                    $ne: req.params.id
                },
                name: req.body.name,

            }
            const data = await this.findMatch(whereObj);
            // console.log(`data-------services-------`, data);
            if (data.length > 0) {
                return {
                    message: "series Name already exist...",
                    status: false,
                    data: data[0]
                };
            } else {
                console.log('req.body', req.body)
                console.log('req.param', req.params)
                let data = await listMatchModel.updateOne({
                    _id: req.params.id
                }, {
                    $set: req.body
                });
                if (data.modifiedCount == 1) {
                    return true;
                }
            }
        } catch (error) {
            throw error;
        }
    }


    async launch_Match(req) {
        let whereObj = {
            is_deleted: false,
            _id: req.params.id
        }
        const data = await this.findMatchDetails(req.params.id);
        // console.log('match details',data)
        if (data.length > 0) {
            let team1 = data[0].team1Id;
            let team2 = data[0].team2Id;
            data[0].start_date = moment(data[0].start_date).format('MMMM Do YYYY, H:MM:SS');

            let batsman1 = 0,
                batsman2 = 0,
                bowlers1 = 0,
                bowlers2 = 0,
                allrounder1 = 0,
                allrounder2 = 0,
                wk1 = 0,
                wk2 = 0,
                criteria = 1;

            let match1Query = {
                matchkey: mongoose.Types.ObjectId(data[0]._id)
            };
            const findAllMatchPlayers = await this.findMatchPlayers(match1Query);
            const findplayer1details = findAllMatchPlayers.filter(o => o.playersData.team.toString() == team1.toString());
            const findplayer2details = findAllMatchPlayers.filter(o => o.playersData.team.toString() == team2.toString());
            if (findAllMatchPlayers.length > 0) {
                for (let players of findAllMatchPlayers) {
                    if (players.playersData.team.toString() == team1.toString()) {
                        if (players.role == 'bowler') {
                            bowlers1++;
                        }
                        if (players.role == 'batsman') {
                            batsman1++;
                        }
                        if (players.role == 'allrounder') {
                            allrounder1++;
                        }
                        if (players.role == 'keeper') {
                            wk1++;
                        }
                        if (players.role == "") {
                            criteria = 0;
                            return {
                                message: `You cannot launch this match because the role of ${players.name} is not defined.`,
                                status: false,
                                data: data[0]
                            };
                        }
                    }
                    if (players.playersData.team.toString() == team2.toString()) {
                        if (players.role == 'bowler') {
                            bowlers2++;
                        }
                        if (players.role == 'batsman') {
                            batsman2++;
                        }
                        if (players.role == 'allrounder') {
                            allrounder2++;
                        }
                        if (players.role == 'keeper') {
                            wk2++;
                        }
                        if (players.role == "") {
                            criteria = 0;
                            return {
                                message: `You cannot launch this match because the role of ${players.name} is not defined.`,
                                status: false,
                                data: data[0]
                            };
                        }
                    }
                }
            }
            let fantasy_type = 'Cricket';
            return {
                'findMatchDetails': data[0],
                fantasy_type,
                batsman1,
                batsman1,
                batsman2,
                bowlers1,
                bowlers2,
                allrounder1,
                allrounder2,
                wk1,
                wk2,
                criteria,
                findAllMatchPlayers,
                findplayer1details,
                findplayer2details
            };
        }

    }
    async findMatchDetails(id) {
        let pipeline = [];

        pipeline.push({
            $match: {
                _id: mongoose.Types.ObjectId(id),
            }
        })
        pipeline.push({
            $lookup: {
                from: 'teams',
                localField: 'team1Id',
                foreignField: '_id',
                as: 'team1data'
            }
        })

        pipeline.push({
            $lookup: {
                from: 'teams',
                localField: 'team2Id',
                foreignField: '_id',
                as: 'team2data'
            }
        })

        pipeline.push({
            $unwind: {
                path: "$team1data"
            }
        })

        pipeline.push({
            $unwind: {
                path: "$team2data"
            }
        })
        let result = await listMatchModel.aggregate(pipeline);
        return result;
    }

    async findMatchPlayers(query) {
        let pipeline = [];

        pipeline.push({
            $match: query
        })

        pipeline.push({
            $lookup: {
                from: 'players',
                localField: 'playerid',
                foreignField: '_id',
                // "pipeline": [{
                //     "$project": { '_id': 1, 'team': 1, 'image': 1 }
                // }
                // ],
                as: 'playersData'
            }
        })

        pipeline.push({
            $unwind: {
                path: "$playersData"
            }
        })
        let result = await matchPlayersModel.aggregate(pipeline);
        return result;
    }

    async findMatchTeam(query) {
        let result = await teamModel.find(query);
        return result;
    }


    async launch(req) {
        const data = await this.findMatchDetails(req.params.id);
        // console.log('match details',data)
        if (data.length > 0) {
            let team1 = data[0].team1Id;
            let team2 = data[0].team2Id;
            data[0].start_date = moment(data[0].start_date).format('MMMM Do YYYY, H:MM:SS');

            let batsman1 = 0,
                batsman2 = 0,
                bowlers1 = 0,
                bowlers2 = 0,
                allrounder1 = 0,
                allrounder2 = 0,
                wk1 = 0,
                wk2 = 0,
                criteria = 1;

            let match1Query = {
                matchkey: mongoose.Types.ObjectId(data[0]._id)
            };
            const findAllMatchPlayers = await this.findMatchPlayers(match1Query);
            if (findAllMatchPlayers.length > 0) {
                for (let players of findAllMatchPlayers) {
                    if (players.playersData.team.toString() == team1.toString()) {
                        if (players.role == 'bowler') {
                            bowlers1++;
                        }
                        if (players.role == 'batsman') {
                            batsman1++;
                        }
                        if (players.role == 'allrounder') {
                            allrounder1++;
                        }
                        if (players.role == 'keeper') {
                            wk1++;
                        }
                        if (players.role == "") {
                            criteria = 0;
                            return {
                                message: `You cannot launch this match because the role of ${players.name} is not defined.`,
                                status: false,
                                data: data[0]
                            };
                        }
                    }
                    if (players.playersData.team.toString() == team2.toString()) {
                        if (players.role == 'bowler') {
                            bowlers2++;
                        }
                        if (players.role == 'batsman') {
                            batsman2++;
                        }
                        if (players.role == 'allrounder') {
                            allrounder2++;
                        }
                        if (players.role == 'keeper') {
                            wk2++;
                        }
                        if (players.role == "") {
                            criteria = 0;
                            return {
                                message: `You cannot launch this match because the role of ${players.name} is not defined.`,
                                status: false,
                                data: data[0]
                            };
                        }
                    }
                }
            }

            if (bowlers1 < 3) {
                criteria = 0;
                return {
                    message: `Minimum 3 bowlers are required in team1 to launch this match.`,
                    status: false,
                    data: data[0]
                };
            } else if (bowlers2 < 3) {
                criteria = 0;
                return {
                    message: `'Minimum 3 bowlers are required in team2 to launch this match.`,
                    status: false,
                    data: data[0]
                };
            } else if (batsman1 < 3) {
                criteria = 0;
                return {
                    message: `Minimum 3 batman are required in team1 to launch this match.`,
                    status: false,
                    data: data[0]
                };
            } else if (batsman2 < 3) {
                criteria = 0;
                return {
                    message: `Minimum 3 batman are required in team2 to launch this match.`,
                    status: false,
                    data: data[0]
                };
            } else if (wk1 < 1) {
                criteria = 0;
                return {
                    message: `Minimum 1 wicketkeeper is required in team1 to launch this match.`,
                    status: false,
                    data: data[0]
                };
            } else if (wk2 < 1) {
                criteria = 0;
                return {
                    message: `Minimum 1 wicketkeeper is required in team2 to launch this match.`,
                    status: false,
                    data: data[0]
                };
            } else if (allrounder1 < 1) {
                criteria = 0;
                return {
                    message: `Minimum 1 all rounder are required in team1 to launch this match.`,
                    status: false,
                    data: data[0]
                };
            } else if (allrounder2 < 1) {
                criteria = 0;
                return {
                    message: `Minimum 1 all rounder are required in team2 to launch this match.`,
                    status: false,
                    data: data[0]
                };
            }


            if (criteria == 1) {
                await listMatchModel.updateOne({
                    _id: req.params.id
                }, {
                    $set: {
                        launch_status: "launched"
                    }
                });
            }

            return true;
        }
    }
    async launchMatchChangeTeamLogo(req) {
        try {
            if(req.fileValidationError){
                return{
                    status:false,
                    message:req.fileValidationError
                }

            }
            if(req.fileValidationError){
                return{
                    status:false,
                    message:req.fileValidationError
                }

            }
            if(req.fileValidationError){
                return{
                    status:false,
                    message:req.fileValidationError
                }

            }
            if (req.params) {
                if (req.file) {
                    const checkLogoinTeam = await teamModel.findOne({
                        _id: req.params.teamId
                    });
                    console.log("checkLogoinTeam.........", checkLogoinTeam)
                    if (checkLogoinTeam) {
                        if (checkLogoinTeam.logo) {
                            let filePath = `public${checkLogoinTeam.logo}`;
                            console.log("fs.existsSync(filePath) == ", fs.existsSync(filePath) == true)
                            if (fs.existsSync(filePath) == true) {
                                fs.unlinkSync(filePath);
                            }
                        }
                    }
                    let log = `/${req.body.typename}/${req.file.filename}`
                    const updateTeamLogo = await teamModel.updateOne({
                        _id: req.params.teamId
                    }, {
                        $set: {
                            logo: log
                        }
                    });
                    console.log("updateTeamLogo............", updateTeamLogo)
                    if (updateTeamLogo.modifiedCount == 1) {
                        return {
                            status: true,
                            message: 'logo successfully change'
                        }
                    } else {
                        return {
                            status: false,
                            message: 'logo not change ..error'
                        }
                    }

                } else {
                    return {
                        status: false,
                        message: 'file not get..'
                    }
                }
            } else {
                return {
                    status: false,
                    message: 'Invalid request..'
                }
            }

        } catch (error) {
            throw error;
        }
    }

    async updateTeam1Playing11(req) {
        try {
            let team1All = req.body.team1_all;
            let team1 = req.body.team1_playing;
            let matchid = req.query.matchid;
            let i = 0;
            
            if (team1.length == 11) {
                await matchPlayersModel.updateMany({
                    $and: [{
                        matchkey: matchid
                    }, {
                        playerid: {
                            $in: team1All
                        }
                    }]
                }, {
                    $set: {
                        vplaying: 0
                    }
                }, {
                    upsert: true
                })
                const updateData = await matchPlayersModel.updateMany({
                    $and: [{
                        matchkey: matchid
                    }, {
                        playerid: {
                            $in: team1
                        }
                    }]
                }, {
                    $set: {
                        vplaying: 1
                    }
                }, {
                    upsert: true
                })

                if (updateData) {
                    return {
                        message: 'update successfully',
                        status: true,
                    }
                }
            } else {
                return {
                    message: 'required 11 players',
                    status: false,
                }
            }
        } catch (error) {
            throw error;
        }
    }

    async updateTeam2Playing11(req) {
        try {
            let team2All = req.body.team2_all;
            let team2 = req.body.team2_playing;
            let matchid = req.query.matchid;
            let i = 0;
            
            if (team2.length == 11) {
                await matchPlayersModel.updateMany({
                    $and: [{
                        matchkey: matchid
                    }, {
                        playerid: {
                            $in: team2All
                        }
                    }]
                }, {
                    $set: {
                        vplaying: 0
                    }
                }, {
                    upsert: true
                })
                const updateData = await matchPlayersModel.updateMany({
                    $and: [{
                        matchkey: matchid
                    }, {
                        playerid: {
                            $in: team2
                        }
                    }]
                }, {
                    $set: {
                        vplaying: 1
                    }
                }, {
                    upsert: true
                })

                if (updateData) {
                    return {
                        message: 'update successfully',
                        status: true,
                    }
                }
            } else {
                return {
                    message: 'required 11 players',
                    status: false,
                }
            }
        } catch (error) {
            throw error;
        }
    }

    async updatePlaying11Launch(req) {
        try {
            let matchid = req.query.matchid;
            await matchPlayersModel.updateMany({ $and: [ {matchkey: {$eq:matchid}} ] }, {$set: {playingstatus: -1}}, {upsert: true});
            const updateData = await matchPlayersModel.updateMany({ $and: [ {matchkey: {$eq:matchid}}, {vplaying: {$eq: 1}} ] }, {$set: {playingstatus: 1}}, {upsert: true});
            await listMatchModel.findOneAndUpdate({_id: matchid}, {$set: {playing11_status: 1}}, {new: true});
            if(updateData) {
                return {
                    message: 'match launched',
                    status: true,
                }
            }
        } catch (error) {
            throw error;
        }
    }

    async launchMatchPlayerUpdateData(req){
        try{
            // matchPlayerId
            console.log("my req...palyer update////////////",req.body,req.file,req.query,req.params);
            const checkMatchPlayer=await matchPlayersModel.find({_id:req.query.matchPlayerId});
            if(checkMatchPlayer.length > 0){
                const updatematchPlayer=await matchPlayersModel.updateOne({_id:req.query.matchPlayerId},{
                    $set:{
                        name:req.body.name,
                        credit:req.body.credit,
                        role:req.body.role,
                    }
                })
                if(updatematchPlayer.modifiedCount == 1){
                    if(req.file || req.body.global){
                        const checkPlayer=await playerModel.find({_id:req.params.playerId});
                        if(checkPlayer.length > 0){
                            let Obj={
                                player_name:req.body.name,
                                credit:req.body.credit,
                                role:req.body.role
                            }
                            if(req.file){
                                if(checkPlayer[0].image){
                                    let fs = require('fs');
                                    let filePath = `public${checkPlayer[0].image}`;
                                    if(fs.existsSync(filePath) == true){
                                       fs.unlinkSync(filePath);
                                    }
                                }
                                let newFile=`/${req.body.typename}/${req.file.filename}`
                                Obj.image=newFile
                            }
                            const updatePlayer=await playerModel.updateOne({_id:req.params.playerId},{
                                $set:Obj
                            })
                            if(updatePlayer.modifiedCount == 1){
                                return{
                                    status:true,
                                    message:'match player and player update successfully'
                                }
                            }else{
                                return{
                                    status:true,
                                    message:'match player update successfully but player update not..'
                                }
                            }
                        }

                    }
                    return{
                        status:true,
                        message:'match player update successfully'
                    }

                }else{
                    return{
                        status:false,
                        message:'match player not update ..error'
                    }
                }

            }else{
                return{
                    status:false,
                    message:'match player not found'
                }
            }

        }catch(error){
            throw error;
        }
    }
    async matchPlayerDelete(req){
        try{
            console.log("req delete",req.query)
            const checkMatchPlayer=await matchPlayersModel.deleteOne({_id:req.query.matchPlayerId});
            // console.log("checkMatchPlayer../////",checkMatchPlayer)
            if(checkMatchPlayer.deletedCount == 1){
                return{
                    status:true,
                    message:'match player delete Successfully'
                }
            }else{
                return{
                    status:false,
                    message:'match player can not delete ..error'
                }
            }

        }catch(error){
            throw error;
        }
    }
    async unlaunchMatch(req){
        try{
            console.log(config.MATCH_LAUNCH_STATUS.PENDING,"<<///config.MATCH_LAUNCH_STATUS.PENDING")
            const changeData=await listMatchModel.updateOne({_id:req.params.id},{
                $set:{
                    launch_status:config.MATCH_LAUNCH_STATUS.PENDING
                }
            })
            console.log("changeData/////////////////",changeData)
            if(changeData.modifiedCount == 1){
                return{
                    status:true,
                    message:'match unlaunch successfully'
                }
            }else{
                return{
                    status:false,
                    message:'match can not unlaunch ..error'
                }
            }

        }catch(error){
            throw error;
        }
    }
}
module.exports = new matchServices();