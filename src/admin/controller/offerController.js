const offerServices = require("../services/offerService");
const offerModel = require("../../models/offerModel");
const moment = require("moment");
const mongoose = require("mongoose");
const config = require("../../config/const_credential");
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
    };
  }
  async addOffer(req, res, next) {
    try {
      res.locals.message = req.flash();
      res.render("offers/addOffer", {
        sessiondata: req.session.data,
        msg: undefined,
      });
    } catch {
      //  next(error);
      req.flash("error", "Something went wrong please try again");
      res.redirect("/");
    }
  }
  async addOfferData(req, res, next) {
    try {
      res.locals.message = req.flash();
      const addOfferData = await offerServices.addOfferData(req);
      // console.log("addOfferData////////////////////......",addOfferData)
      if (addOfferData.status == true) {
        req.flash('success',addOfferData.message);
        res.redirect("/view-all-offer");
    } else {
        // req.flash("error",addOfferData.message);
        res.render('offers/addOffer', { sessiondata: req.session.data, msg: addOfferData.message });
    }
    
    } catch (error) {
      //  next(error);
      req.flash("error", "Something went wrong please try again");
      res.redirect("/add-offer");
    }
  }
  async viewAllOffer(req, res, next) {
    try {
      res.locals.message = req.flash();
      res.render("offers/viewAllOffer", { sessiondata: req.session.data });
    } catch (error) {
      //  next(error);
      req.flash("error", "Something went wrong please try again");
      res.redirect("/");
    }
  }
  async viewAllOfferDataTable(req, res, next) {
    try {
      let limit1 = req.query.length;
      let start = req.query.start;
      let sortObject = {},
        dir,
        join;
      let conditions = {};

      offerModel.countDocuments(conditions).exec((err, rows) => {
        // console.log("rows....................",rows)
        let totalFiltered = rows;
        let data = [];
        let count = 1;
        offerModel
          .find(conditions)
          .skip(Number(start) ? Number(start) : "")
          .limit(Number(limit1) ? Number(limit1) : "")
          .exec((err, rows1) => {
            // console.log('--------rows1-------------', rows1);
            if (err) console.log(err);

            rows1.forEach((index) => {
                                              
                        data.push({
                            'count': count,
                            'title': index.title,
                            // 'min_amount': index.min_amount,
                            'max_amount': index.max_amount,
                            'bonus': index.bonus,
                            // 'image':logo,
                            'offer_code': index.offer_code,
                            'type': index.type,
                            'user_time': index.user_time,
                            // 'amt_limit': index.amt_limit,
                            // 'start_date': start_date,
                            // 'expire_date': expire_date,
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
            res.locals.message = req.flash();
            const editoffers = await offerServices.editoffers_page(req);

      if (editoffers) {
        res.render("offers/editOffer", {
          sessiondata: req.session.data,
          data: editoffers[0],
          msg: undefined,
        });
      }
    } catch (error) {
      //  next(error);
      req.flash("error", "Something went wrong please try again");
      res.redirect("/view-all-offer");
    }
  }
  async editOfferData(req, res, next) {
    try {
      res.locals.message = req.flash();
      const editOfferData = await offerServices.editOfferData(req);
      if (editOfferData.status == true) {
        req.flash('success',editOfferData.message)
        res.redirect("/view-all-offer");
    } else {
        req.flash("error",editOfferData.message)
        res.redirect(`/editoffers?offerId=${req.body.offerId}`)
        // res.render('offers/editOffer', { sessiondata: req.session.data, data: editOfferData.data, msg: editOfferData.message });
    }
    } catch (error) {
      //  next(error);
      req.flash("error", "Something went wrong please try again");
      res.redirect("/view-all-offer");
    }
  }
  async deleteoffers(req, res, next) {
    try {
      const deleteoffers = await offerServices.deleteoffers(req);
      if (deleteoffers.status == true) {
        req.flash("success",deleteoffers.message)
        res.redirect("/view-all-offer");
    }else{
        req.flash("error",deleteoffers.message)
        res.redirect("/view-all-offer");
    }
    } catch (error) {
      //  next(error);
      req.flash("error", "Something went wrong please try again");
      res.redirect("/view-all-offer");
    }
  }
}

module.exports = new offerController();
