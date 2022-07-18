const botUserService = require("../services/botUserService");
const classicBotService = require("../services/classicBotService");
const userModel = require("../../models/userModel");
const botPercentageModel = require("../../models/setBotPercentageModel");
const moment = require("moment");
const constant = require("../../config/const_credential");
class botUserController {
  constructor() {
    return {
      botUserPage: this.botUserPage.bind(this),
      botUserData: this.botUserData.bind(this),
      viewBotUserPage: this.viewBotUserPage.bind(this),
      viewBotUserData: this.viewBotUserData.bind(this),
      joinBotUser: this.joinBotUser.bind(this),
      setPercentagePage: this.setPercentagePage.bind(this),
      setPercentageData: this.setPercentageData.bind(this),
      setPercentageDatatable: this.setPercentageDatatable.bind(this),
      updatePercentageData: this.updatePercentageData.bind(this),
      // deletePercentageData: this.deletePercentageData.bind(this),
      joinBotUserAccordingPercentage: this.joinBotUserAccordingPercentage.bind(this),
    };
  }

  async botUserPage(req, res, next) {
    try {
      res.locals.message = req.flash();
      res.render("botuser/addBotUser", {
        sessiondata: req.session.data,
      });
    } catch (error) {
      throw error;
    }
  }

  async botUserData(req, res, next) {
    try {
      const botUser = await botUserService.botUserData(req);
      if (botUser.status == true) {
        req.flash("success", botUser.message);
        res.redirect("/add-botuser");
      }
    } catch (error) {
      throw error;
    }
  }

  async viewBotUserPage(req, res, next) {
    try {
      res.locals.message = req.flash();

      const { name, email, date } = req.query;
      res.render("botuser/viewBotUser", {
        sessiondata: req.session.data,
        teamName: name,
        emailValue: email,
        date: date,
      });
    } catch (error) {
      // throw error;
      req.flash("error", "..server error..");
      res.redirect("/");
    }
  }

  async viewBotUserData(req, res, next) {
    try {
      let limit1 = req.query.length;
      let start = req.query.start;
      let sortObject = {},
        dir,
        join,
        conditions = { user_status: { $ne: 0 } };
      if (req.query.email) {
        conditions.email = { $regex: req.query.email };
      }
      if (req.query.name) {
        conditions.team = {
          $regex: new RegExp(req.query.name.toLowerCase(), "i"),
        };
      }
      if (req.query.date) {
        conditions = {
          $and: [
            {
              createdAt: {
                $gte: moment(new Date(req.query.date)).format("YYYY-MM-DD"),
              },
            },
            {
              createdAt: {
                $lt: moment(
                  moment(new Date(req.query.date)).add("1", "day")
                ).format("YYYY-MM-DD"),
              },
            },
          ],
        };
      }

      userModel.countDocuments(conditions).exec((err, rows) => {
        let totalFiltered = rows;
        let data = [];
        let count = 1;
        userModel
          .find(conditions)
          .skip(Number(start) ? Number(start) : "")
          .limit(Number(limit1) ? Number(limit1) : "")
          .sort(sortObject)
          .exec((err, rows1) => {
            rows1.forEach((index) => {
              data.push({
                count: count,
                username: index.username,
                team: index.team,
                email: `<a href="/getUserDetails/${index._id}">${index.email}</a>`,
                mobile: index.mobile || "",
                refercode: index.refer_code || "",
                date: `<span class="text-warning">${moment(
                  index.createdAt
                ).format("YYYY-MM-DD")}</span>`,
                action: `<div class="dropdown">
                                <button class="btn btn-primary btn-md rounded-pill dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    Action
                                </button>
                                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                    <a class="dropdown-item" href="/viewtransactions/${index._id}">User Transactions</a>
                                </div>
                            </div>`,
              });
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

  async joinBotUser(req, res, next) {
    try {
      const joinbotuser = await botUserService.joinBotUser(req);
      if (joinbotuser.status == true) {
        req.flash("success", joinbotuser.message);
        res.redirect("/create-custom-contest");
      }
      if (joinbotuser.status == false) {
        req.flash("error", joinbotuser.message);
        res.redirect("/create-custom-contest");
      }
    } catch (error) {
      throw error;
    }
  }

  async setPercentagePage(req, res, next) {
    try {
      let pquery = req.query.percentageid;
      const pdata = await botPercentageModel.findOne({ _id: pquery });
      res.locals.message = req.flash();
      res.render("botuser/setPercentage", {
        sessiondata: req.session.data,
        pquery: pquery,
        pdata: pdata,
      });
    } catch (error) {
      throw error;
    }
  }

  async setPercentageData(req, res, next) {
    try {
      const botPercentage = await botUserService.setPercentageData(req);
      if (botPercentage.status == true) {
        req.flash("success", botPercentage.message);
        res.redirect("/set-percentage");
      }
      if (botPercentage.status == false) {
        req.flash("error", botPercentage.message);
        res.redirect("/set-percentage");
      }
    } catch (error) {
      throw error;
    }
  }

  async setPercentageDatatable(req, res, next) {
    try {
      let limit = req.query.limit;
      let start = req.query.start;
      let sortObj = {},
        dir,
        join;
      let condition = {};
      botPercentageModel.countDocuments(condition).exec((err, rows) => {
        let totalFiltered = rows;
        let data = [];
        let count = 1;
        botPercentageModel
          .find(condition)
          .skip(Number(start) ? Number(start) : "")
          .limit(Number(limit) ? Number(limit) : "")
          .sort(sortObj)
          .exec((err, rows1) => {
            rows1.forEach((doc) => {
              data.push({
                count: `<div class="text-center">${count}</div>`,
                hours: `<div class="text-center">${doc.hours}</div>`,
                percentage: `<div class="text-center">${doc.percentage}</div>`,
                action: `<div class="text-center">
                                <a class="btn w-35px h-35px mr-1 btn-orange text-uppercase btn-sm" data-toggle="tooltip" title="Edit" href="/set-percentage?percentageid=${doc._id}"><i class="fas fa-pencil"></i></a>
                            </div>`,
              });
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

  async updatePercentageData(req, res, next) {
    try {
      const updatePercentage = await botUserService.updatePercentageData(req);
      if (updatePercentage.status == true) {
        req.flash("success", updatePercentage.message);
        res.redirect("/set-percentage");
      }
    } catch (error) {
      throw error;
    }
  }

  /**
  <a class="btn w-35px h-35px mr-1 btn-danger text-uppercase btn-sm" data-toggle="tooltip" title="Delete" href="/delete-percentage?percentageid=${doc._id}"><i class="far fa-trash-alt"></i></a>
   */

  // async deletePercentageData(req, res, next) {
  //   try {
  //     const pquery = req.query.percentageid;
  //     const deletePercentage = await botPercentageModel.deleteOne({
  //       _id: pquery,
  //     });
  //     if (deletePercentage) {
  //       req.flash("success", "percentage deleted successfully");
  //       res.redirect("/set-percentage");
  //     }
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async joinBotUserAccordingPercentage(req, res, next) {
    try {
      const joinBot = await botUserService.joinBotUserAccordingPercentage(req);
      if (joinBot.status == true) {
        res.json(joinBot.data);
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new botUserController();
