const pointServices = require('../services/pointService');
const mongoose = require("mongoose");
const playersServices = require("../services/playerServices");
const playerModel = require("../../models/playerModel");



class playersController {
    constructor() {
        return {
            viewAllPlayer: this.viewAllPlayer.bind(this),
            view_player_datatable: this.view_player_datatable.bind(this),
            edit_player:this.edit_player.bind(this),
            edit_player_data:this.edit_player_data.bind(this),
            saveplayerroles:this.saveplayerroles.bind(this),
        }
    }
    async viewAllPlayer(req, res, next) {
        try {
            const getData = await playersServices.viewAllPlayer(req);
            let querydata={}
            if(req.query.role){
                querydata.role=req.query.role
            }
            if(req.query.team){
                querydata.team=req.query.team
            }
            if(req.query.playername){
                // querydata.playername = { $regex: new RegExp("^" + req.query.playername.toLowerCase(), "i") }
                querydata.playername=req.query.playername
            }
            if (getData.status == true) {
                res.render("players/viewAllPlayer", { sessiondata: req.session.data,teamName: getData.teamName,querydata });
            } else if (getData.status == false) {
                req.flash('error', getData.message);
                res.render("players/viewAllPlayer",{sessiondata: req.session.data});
            }

        } catch (error) {
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/");
        }
    }
    async view_player_datatable(req, res, next) {
        try {
            console.log('req------DATATABLE-------controller');
            let limit1 = req.query.length;
            let start = req.query.start;
            let sortObject = {},
                dir, join
            let conditions = {};
            if (req.query.playername) {
                conditions.player_name ={ $regex: new RegExp("^" + req.query.playername.toLowerCase(), "i") } 
            }
            if(req.query.role){
                conditions.role = req.query.role 
            }
            if(req.query.team){
                conditions.team = req.query.team 
            }
            console.log("conditions.....", conditions);
            playerModel.countDocuments(conditions).exec((err, rows) => {
                // console.log("rows....................",rows)
                let totalFiltered = rows;
                let data = [];
                let count = 1;
                playerModel.find(conditions).skip(Number(start) ? Number(start) : '').limit(Number(limit1) ? Number(limit1) : '').exec((err, rows1) => {
                    // console.log('--------rows1-------------', rows1);
                    if (err) console.log(err);
                    rows1.forEach((index) => {
                        // console.log('index------------->', index)

                        let logo
                        if (index.image) {
                            logo = `<img src="${index.image}" class="w-40px view_team_table_images h-40px rounded-pill">`;
                        } else {
                            logo = `<img src="/player_image.png" class="w-40px view_team_table_images h-40px rounded-pill">`;
                        }
                        data.push({
                            "count": count,
                            "player_name": index.player_name,
                            "players_key": index.players_key,
                            "role": index.role,
                            "credit": `<span id="credittd${index._id}">${index.credit}</span>`,
                            'image': logo,
                            'action': `<td><a href="/edit_player/${index._id}" class="btn btn-sm w-35px h-35px mr-1 mb-1 btn-orange" data-toggle="tooltip" title="Edit"><i class="fas fa-pencil"></i></a>`+`<a onclick="updateplayer('${index._id}','.${index.role}.',${index.credit})" class="btn btn-sm w-35px h-35px mr-1 mb-1 btn-primary" data-toggle="tooltip" title="Update credit" id="updateplayer${index._id}"><i class="fas fa-sync-alt"></i></a><a onclick="saveplayer('${index._id}')" class="btn btn-sm w-35px h-35px mr-1 mb-1 btn-success" id="saveplayer${index._id}" style="display:none;" data-toggle="tooltip" title="Save credit"><i class="fad fa-save"></i></a></td>`,
                        });
                        count++;

                        if (count > rows1.length) {

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


        } catch (error) {
             next(error);
        }
    }
    async edit_player(req,res,next){
        try{
            res.locals.message = req.flash();
            const getData=await playersServices.edit_player(req);
            if(getData.status == true){
                res.render('players/editPlayer',{sessiondata:req.session.data,playerdata:getData.playerdata});
            }else if(getData.status == false){
                req.flash("error",getData.message)
            }

        }catch(error){
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/view-all-players");
        }
    }
    async edit_player_data(req,res,next){
        try{
            const postData=await playersServices.edit_player_data(req);
            if(postData.status==true){
                req.flash('success',postData.message);
                res.redirect(`/edit_player/${req.params.playerId}`)
            }else if(postData.status==false){
                req.flash('error',postData.message);
                res.redirect(`/edit_player/${req.params.playerId}`)
            }

        }catch(error){
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/view-all-players");
        }
    }
    async saveplayerroles(req,res,next){
        try{
            const postCradit=await playersServices.saveplayerroles(req);
            if(postCradit.status == true){
               res.send({data:1})
            }else if(postCradit.status == false){
               res.send({data:0,msg:postCradit.message})
            }

        }catch(error){
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/view-all-players");
        }
    }


}
module.exports = new playersController();