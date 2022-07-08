const popupNotificationService = require("../services/popupNotificationService");
const adminModel = require("../../models/adminModel");
const config = require("../../config/const_credential");
class popupNotificationController {
  constructor() {
    return {
      popup: this.popup.bind(this),
      popupData: this.popupData.bind(this),
      addPopup: this.addPopup.bind(this),
      deletePopup: this.deletePopup.bind(this),
      addPopupData: this.addPopupData.bind(this),
    };
  }

  async popup(req, res, next) {
    try {
      res.locals.message = req.flash();
      res.render("popup/popup", {
        sessiondata: req.session.data,
      });
    } catch (error) {
      throw error;
    }
  }

  async popupData(req, res, next) {
    try {
      let limit = req.query.length;
      let start = req.query.start;
      let sortObj = {},
        dir,
        join;
      let condition = { role: "0" };
      adminModel.countDocuments(condition).exec((err, rows) => {
        let totalFiltered = rows;
        let data = [];
        let count = 1;
        adminModel
          .find(condition)
          .skip(Number(start) ? Number(start) : "")
          .limit(Number(limit) ? Number(limit) : "")
          .exec((err, rows1) => {
            rows1.forEach(async (doc) => {
              if(doc.popup_notify_image !== '') {
                data.push({
                  count: `<div class="text-center">${count}</div>`,
                  title: `<div class="text-center">${doc.popup_notify_title}</div>`,
                  popup: `<div class="text-center"><img src="${doc.popup_notify_image}" class="w-100px view_team_table_images h-100px rounded-pill" alt="popup notification image"></div>`,
                });
              }
              count++;
              if (count > rows1.length) {
                let json_data = JSON.stringify({ data });
                res.send(json_data);
              }
            });
          });
      });
    } catch (error) {
      throw error;
    }
  }

  async addPopup(req, res, next) {
    try {
      res.locals.message = req.flash();
      res.render("popup/addPopup", {
        sessiondata: req.session.data,
      });
    } catch (error) {
      throw error;
    }
  }

  async deletePopup(req, res, next) {
    try {
      const delPopup = await popupNotificationService.deletePopup(req);
      if (delPopup.status == true) {
        req.flash("success", delPopup.message);
        res.redirect("/popup");
      } else if (delPopup.status == false) {
        req.flash("error", delPopup.message);
        res.redirect("/add-popup");
      }
    } catch (error) {
      throw error;
    }
  }

  async addPopupData(req, res, next) {
    try {
      const popup = await popupNotificationService.addPopupData(req);
      if (popup.status == true) {
        req.flash("success", popup.message);
        res.redirect("/popup");
      } else if (popup.status == false) {
        req.flash("error", popup.message);
        res.redirect("/add-popup");
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new popupNotificationController();
