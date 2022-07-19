const moment = require("moment");

const teamsServices = require('../services/teamsServices');
const teamModel = require('../../models/teamModel');

class teamsController {
    constructor() {
        return {
            viewTeams: this.viewTeams.bind(this),
            teamsDataTable: this.teamsDataTable.bind(this),
            editTeam: this.editTeam.bind(this),
            edit_Team_Data: this.edit_Team_Data.bind(this),
            addTeamPage:this.addTeamPage.bind(this),
            addTeamData:this.addTeamData.bind(this),

        }
    }

    async viewTeams(req, res, next) {
        try {
            // console.log("req.body from view teams apge render.............",req.query);
            res.render("viewTeam/viewTeams", {sessiondata: req.session.data, teamName: req.query.teamName });
        } catch (error) {
            // next(error);\
            req.flash('error','something is wrong please try again later');
            res.redirect("/");
        }
    }

    async teamsDataTable(req, res, next) {
        try {
            console.log('req------DATATABLE-------controller');
            let limit1 = req.query.length;
            let start = req.query.start;
            let sortObject = {},
                dir, join
            let conditions = {};
            if (req.query.teamName) {
                conditions.teamName ={ $regex: new RegExp("^" + req.query.teamName.toLowerCase(), "i") }
            }
            console.log("conditions.....", conditions);
            teamModel.countDocuments(conditions).exec((err, rows) => {
                // console.log("rows....................",rows)
                let totalFiltered = rows;
                let data = [];
                let count = 1;
                teamModel.find(conditions).skip(Number(start) ? Number(start) : '').limit(Number(limit1) ? Number(limit1) : '').exec((err, rows1) => {
                    // console.log('--------rows1-------------', rows1);
                    if (err) console.log(err);
                    rows1.forEach((index) => {
                        let logo
                        if (index.logo) {
                            logo = `<img src="${index.logo}" class="w-40px view_team_table_images h-40px rounded-pill">`;
                        } else {
                            logo = `<img src="/team_image.png" class="w-40px view_team_table_images h-40px rounded-pill">`;
                        }
                        data.push({
                            "count": count,
                            "teamName": index.teamName,
                            "short_name": index.short_name,
                            "logo": logo,
                            "Action": `<a href="/edit-Team/${index._id}" class="btn btn-sm btn-orange w-35px h-35px text-uppercase text-nowrap" data-toggle="tooltip" title="Edit"><i class="fad fa-pencil"></i></a>`
                        });
                        count++;

                        if (count > rows1.length) {
                            // console.log(`data------SERVICES---------`, data);
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

    async editTeam(req, res, next) {
        try {
            res.locals.message = req.flash();
            const data = await teamsServices.editTeam(req);
            // console.log('data---controller',data);
            if (data) {
                res.render("viewTeam/editTeam", { sessiondata: req.session.data, msg: undefined, data });
            }
        } catch (error) {
            // next(error);
            req.flash('error','something is wrong please try again later');
            res.redirect("/view-teams");
        }
    }

    async edit_Team_Data(req, res, next) {
        try {
            console.log('controller body ---', req.body, req.params, req.file);
            const data = await teamsServices.edit_Team_Data(req);
            console.log('data---controller...', data);
            if (data) {
                // req.flash("teamsadded", "teams add succssfully")
                return res.redirect("/view-teams");
            }
            if (data === false) {
                return res.render("viewTeam/editTeams", { sessiondata: req.session.data, msg: "error occured teams not inserted", data: data.data });
            }
        } catch (error) {
            // next(error);
            req.flash('error','something is wrong please try again later');
            res.redirect("/view-teams");
        }
    }
    async addTeamPage(req,res,next){
        try{
            res.locals.message = req.flash();
            res.render("viewTeam/addTeam", { sessiondata: req.session.data, msg: undefined });

        }catch(error){
            console.log(error)
        }
    }
    async addTeamData(req,res,next){
        try{
            let data=await teamsServices.addTeamData(req);
            if(data.status){
                req.flash('success',data.message);
                res.redirect("/add_team_page")
            }else{
                req.flash('error',data.message);
                res.redirect("/add_team_page")
            }

        }catch(error){
            console.log(error)
            req.flash('error','soething wrong please try again letter')
        }
    }



}
module.exports = new teamsController();