const seriesDetailsServices = require('../services/seriesDetailsService');
const mongoose = require("mongoose");
const moment=require("moment");
const listMatchesModel = require("../../models/listMatchesModel");


class seriesDetailsController {
    constructor() {
        return {
            seriesDetails_Page: this.seriesDetails_Page.bind(this),
            getFullSeriesDataTable_Page: this.getFullSeriesDataTable_Page.bind(this),
        }
    }
    async seriesDetails_Page(req, res, next) {
        try {
            res.locals.message = req.flash();
            const getseries = await seriesDetailsServices.seriesList(req);
            let matchId = req.query.matchid;
            res.render("seriesDetails/fullSeriesdetail", { sessiondata: req.session.data, seriesData: getseries, matchId });

        } catch (error) {
            // next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/");
        }
    }
    async getFullSeriesDataTable_Page(req, res, next) {
        try {
            console.log("full sereis backend ......")
            let limit1 = req.query.length;
            let start = req.query.start;
            let sortObject = {},
                dir, join
           
            let conditions = { series: mongoose.Types.ObjectId(req.query.seriesId) }
            listMatchesModel.countDocuments(conditions).exec((err, rows) => {
                let totalFiltered = rows;
                let data = [];
                let count = 1;
                listMatchesModel.find(conditions).populate('team1Id').populate('team2Id').populate('series').skip(Number(start) ? Number(start) : '').limit(Number(limit1) ? Number(limit1) : '').sort(sortObject).exec((err, rows1) => {
                    // console.log('--------rows1-------------', rows1.length);
                    if (err) console.log(err);
                    rows1.forEach((index) => {
                        // console.log('index-------listMatch------>', index)
                        let actions
                        if(index.launch_status == 'launched'){
                            actions=`<span class="dtr-data"><a href="/allcontests/${index._id}" class="btn btn-sm text-uppercase btn-info"><i class="fas fa-eye"></i>&nbsp; View Contests</a></span>`
                        }else{
                            actions=''
                        }
                        data.push({
                            'count': count,
                            'name': index.name,
                            'team1Id': index.team1Id.teamName,
                            'team2Id': index.team2Id.teamName,
                            'real_matchkey': index.real_matchkey,
                            'series': index.series.name,
                            'format':index.format,
                            'start_date':`<span class="font-weight-bold text-success">${moment(index.start_date).format('Do MMMM YYYY, HH:mm')}</span>`,
                            'status':index.status,
                            'launch_status':index.launch_status,
                            'final_status':index.final_status,
                            'squadstatus':index.squadstatus,
                            'action':actions
                        });
                        count++;
                        console.log("data.............", data)
                        if (count > rows1.length) {
                            let json_data = JSON.stringify({"recordsTotal": rows,
                            "recordsFiltered": totalFiltered,
                            "data": data});
                            res.send(json_data);
                        }
                    });
                });
            });

        } catch (error) {
            next(error);
        }
    }


}
module.exports = new seriesDetailsController();