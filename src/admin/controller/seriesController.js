const moment = require("moment");

const seriesServices = require('../services/seriesServices');
const seriesModel = require('../../models/addSeriesModel');

class seriesController {
    constructor() {
        return {
            Series_page: this.Series_page.bind(this),
            addSeries: this.addSeries.bind(this),
            viewSeries: this.viewSeries.bind(this),
            seriesDataTable: this.seriesDataTable.bind(this),
            updateStatusforSeries: this.updateStatusforSeries.bind(this),
            edit_Series: this.edit_Series.bind(this),
            editSeriesData: this.editSeriesData.bind(this),
        }
    }

    async Series_page(req, res, next) {
        try {
            res.locals.message = req.flash();
            res.render("series/createSeries", { sessiondata: req.session.data, msg: undefined });
        } catch (error) {
            // next(error);
            req.flash('error','something is wrong please try again later')
            res.redirect("/")
        }
    }

    async addSeries(req, res, next) {
        try {
            // console.log('req-------------controller', req.body);
            const data = await seriesServices.addSeries(req);
            console.log(`data`, data);
            if (data.status == true) {
                req.flash('success',data.message)
                res.redirect("/add-series");
            }else if (data.status == false) {
                req.flash('error',data.message)
                res.redirect("/add-series");
            }
        } catch (error) {
            req.flash('error','something is wrong please try again later');
            res.redirect('/add-series');
        }
    }

    async viewSeries(req, res, next) {
        try {
            res.locals.message = req.flash();
            // console.log("req.body from view series apge render.............", req.query);
            res.render("series/viewSeries", { sessiondata: req.session.data, seriesName: req.query.seriesName, start_date: req.query.start_date, end_date: req.query.end_date });
        } catch (error) {
            // next(error);
            req.flash('error','something is wrong please try again later');
            res.redirect("/");
        }
    }

    async seriesDataTable(req, res, next) {
        try {
            // console.log('req------DATATABLE-------controller');
            let limit1 = req.query.length;
            let start = req.query.start;
            let sortObject = {},
                dir, join
               
            let conditions = {};
            if (req.query.seriesName) {
                conditions.name = {
                  $regex: new RegExp(req.query.seriesName.toLowerCase(), "i"),
                };
                // conditions.name = { $regex: req.query.seriesName }
              }
              if (req.query.start_date) {
                if (!req.query.end_date) {
                  conditions.start_date = {
                    $gte: moment(req.query.start_date).format("YYYY-MM-DD HH:mm"),
                  };
                }
              }
              if (req.query.end_date) {
                if (!req.query.start_date) {
                  conditions.end_date = {
                    $gte: moment(req.query.end_date).format("YYYY-MM-DD HH:mm"),
                  };
                }
              }
              if (req.query.start_date && req.query.end_date) {
                conditions.start_date = {
                  $gte: moment(req.query.start_date).format("YYYY-MM-DD HH:mm"),
                };
                conditions.end_date = {
                  $lte: moment(req.query.end_date).format("YYYY-MM-DD HH:mm"),
                };
              }
            
            seriesModel.countDocuments(conditions).exec((err, rows) => {
                // console.log("rows....................",rows)
                let totalFiltered = rows;
                let data = [];
                let count = 1;
                seriesModel.find(conditions).skip(Number(start) ? Number(start) : '').limit(Number(limit1) ? Number(limit1) : '').exec((err, rows1) => {
                    console.log('--------rows1-------------', rows1);
                    if (err) console.log(err);
                    rows1.forEach((index) => {
                        // console.log('index------------->', index)

                        let status, action;
                        if ((index.status).toLowerCase() == 'opened') {
                            status = `<span style="color:green;">${index.status}</span>`;
                            action = `<li><a class="dropdown-item" href="/update-series-status/${index._id}?status=closed">Inactivate Series</a></li>`
                        } else {
                            status = `<span style="color:red;">${index.status}</span>`
                            action = `<li><a class="dropdown-item" href="/update-series-status/${index._id}?status=opened">Activate Series</a></li>`
                        }
                        data.push({
                            "fantasy_type": index.fantasy_type,
                            "name": index.name,
                            "start_date": moment(index.start_date).format("dddd, MMMM Do YYYY, h:mm:ss a"),
                            "end_date": moment(index.end_date).format("dddd, MMMM Do YYYY, h:mm:ss a"),
                            "status": status,
                            "Actions": `<div class="dropdown">
                            <button class="btn btn-sm btn-primary btn-active-pink dropdown-toggle dropdown-toggle-icon" type="button" data-toggle="dropdown" aria-expanded="false">
                              Action
                            </button>
                            <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                              <li> <a class="dropdown-item" href="/edit-series/${index._id}">Edit</a></li>
                              ${action}
                              
                            </ul>
                          </div>`
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

    async updateStatusforSeries(req, res, next) {
        try {
            res.locals.message = req.flash();
            const data = await seriesServices.updateStatusforSeries(req);
            console.log(data);
            if (data) {
                res.redirect('/view-series');
            }
            // return res.status(200).json(Object.assign({ success: true }, data));
        } catch (error) {
            // next(error);
            req.flash('error','something is wrong please try again later');
            res.redirect('/view-series');
        }
    }

    async edit_Series(req, res, next) {
        try {
            res.locals.message = req.flash();
            const data = await seriesServices.edit_Series(req);
            console.log('data---controller',data);
            if (data.status== true ) {
                res.render("series/editSeries", {sessiondata: req.session.data, msg: undefined, data: data.data[0] });
            }else{
                req.flash('error',data.message);
                res.redirect('/view-series');
            }
        } catch (error) {
            // next(error);
            req.flash('error','something is wrong please try again later');
            res.redirect('/view-series');
        }
    }

    async editSeriesData(req, res, next) {
        try {
            res.locals.message = req.flash();
            const data = await seriesServices.editSeriesData(req);
            console.log('data---controller', data);
            if (data.status == true) {
                req.flash('success',data.message)
                res.redirect(`/edit-series/${req.params.id}`);
            }else if (data.status == false) {
                req.flash('error',data.message)
                res.redirect(`/edit-series/${req.params.id}`);
            }
        } catch (error) {
            // next(error);
            req.flash('error','something is wrong please try again later');
            res.redirect('/view-series');
        }
    }


}
module.exports = new seriesController();