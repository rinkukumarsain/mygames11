const offerServices = require('../services/offerService');
const offerModel = require("../../models/offerModel");
const moment = require("moment");
const mongoose = require("mongoose");
class offerController {
    constructor() {
        return {
            addOffer: this.addOffer.bind(this),
            addOfferData: this.addOfferData.bind(this),
            viewAllOffer: this.viewAllOffer.bind(this),
            viewAllOfferDataTable: this.viewAllOfferDataTable.bind(this),
            editoffers_page: this.editoffers_page.bind(this),
            editOfferData: this.editOfferData.bind(this),
            deleteoffers: this.deleteoffers.bind(this),
        }
    }
    async addOffer(req, res, next) {
        try {
            res.render('offers/addOffer', { sessiondata: req.session.data, msg: undefined });
        } catch {
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/");
        }
    }
    async addOfferData(req, res, next) {
        try {
            const addOfferData = await offerServices.addOfferData(req)
                // console.log("addOfferData////////////////////......",addOfferData)
            if (addOfferData.message) {
                res.render('offers/addOffer', { sessiondata: req.session.data, msg: addOfferData.message })
            } else if (addOfferData) {
                res.redirect("/view-all-offer")
            }

        } catch (error) {
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/add-offer");
            
        }
    }
    async viewAllOffer(req, res, next) {
        try {

            res.render('offers/viewAllOffer', { sessiondata: req.session.data, });

        } catch (error) {
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/");
        }
    }
    async viewAllOfferDataTable(req, res, next) {
        try {
            let limit1 = req.query.length;
            let start = req.query.start;
            let sortObject = {},
                dir, join
            let conditions = {};

            console.log("conditions.....", conditions);
            offerModel.countDocuments(conditions).exec((err, rows) => {
                // console.log("rows....................",rows)
                let totalFiltered = rows;
                let data = [];
                let count = 1;
                offerModel.find(conditions).skip(Number(start) ? Number(start) : '').limit(Number(limit1) ? Number(limit1) : '').exec((err, rows1) => {
                    // console.log('--------rows1-------------', rows1);
                    if (err) console.log(err);

                    rows1.forEach((index) => {

                        let start_date_format = moment(index.start_date, 'YYYY-MM-DD hh:mm:ss').format('dddd, DD-MMM-YYYY, h:mm:ss a');
                        console.log("start_date_format......", start_date_format)
                        let start_date = `<div class="text-center"><span class="font-weight-bold text-success">${start_date_format.split(',')[0]},</span><br>
                        <span class="font-weight-bold text-primary">${start_date_format.split(',')[1]}</span><br>
                        <span class="font-weight-bold text-danger">${start_date_format.split(',')[2]}</span></div>`

                        let expire_date_format = moment(index.expire_date, 'YYYY-MM-DD hh:mm:ss').format('dddd, DD-MMM-YYYY, h:mm:ss a');
                        let expire_date = `<div class="text-center"><span class="font-weight-bold text-success">${expire_date_format.split(',')[0]},</span><br>
                        <span class="font-weight-bold text-primary">${expire_date_format.split(',')[1]}</span><br>
                        <span class="font-weight-bold text-danger">${expire_date_format.split(',')[2]}</span></div>`

                        data.push({
                            'count': count,
                            'title': index.title,
                            'min_amount': index.min_amount,
                            'max_amount': index.max_amount,
                            'bonus': index.bonus,
                            'offer_code': index.offer_code,
                            'type': index.type,
                            'user_time': index.user_time,
                            'amt_limit': index.amt_limit,
                            'start_date': start_date,
                            'expire_date': expire_date,
                            'action': ` <a href="/editoffers?offerId=${index._id}" class="btn btn-sm btn-primary w-35px h-35px text-uppercase"><i class ='fas fa-pencil'></i></a>
                            <a  onclick="delete_sweet_alert('/deleteoffers?offerId=${index._id}', 'Are you sure you want to delete this data?')" class="btn btn-sm btn-danger w-35px h-35px text-uppercase"><i class='fas fa-trash-alt'></i></a></div>`
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
    async editoffers_page(req, res, next) {
        try {
            const editoffers = await offerServices.editoffers_page(req);

            console.log("editoffers...............", editoffers)
            if (editoffers) {
                res.render("offers/editOffer", { sessiondata: req.session.data, data: editoffers[0], msg: undefined });
            }

        } catch (error) {
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/view-all-offer");
        }
    }
    async editOfferData(req, res, next) {
        try {

            const editOfferData = await offerServices.editOfferData(req);
            console.log("editOfferData////////////////////......", editOfferData)
            if (editOfferData.message) {
                res.render('offers/editOffer', { sessiondata: req.session.data, data: editOfferData.data, msg: editOfferData.message });
            } else if (editOfferData) {
                res.redirect("/view-all-offer");
            }

        } catch (error) {
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/view-all-offer");
        }
    }
    async deleteoffers(req, res, next) {
        try {
            const deleteoffers = await offerServices.deleteoffers(req);
            if (deleteoffers) {
                res.redirect("/view-all-offer");
            }

        } catch (error) {
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/view-all-offer");
        }
    }


}
module.exports = new offerController();