const moment = require("moment");
const mongoose = require("mongoose");
const notificationServices = require("../services/notificationService");
const userModel = require("../../models/userModel");

const config = require("../../config/const_credential");
class notificationController {
  constructor() {
    return {
      getUser: this.getUser.bind(this),
      sendPushNotification: this.sendPushNotification.bind(this),
      sendPushNotificationData: this.sendPushNotificationData.bind(this),
      sendEmailNotification: this.sendEmailNotification.bind(this),
      sendEmailNotificationData: this.sendEmailNotificationData.bind(this),
      smsNotification:this.smsNotification.bind(this),
      smsNotificationData:this.smsNotificationData.bind(this),
    };
  }

  async getUser(req, res, next) {
    try {
      let option = '';
      let query = {
        user_status: 0,
        email: { $regex: req.body.gettypevalue }
      }
      let userData = await notificationServices.getUser(query);
      if (userData && Array.isArray(userData) && userData.length > 0) {
        for (let user of userData) {
          let showname = `<div class="d-flex bg-white shadow rounded p-2 my-2 mx-0 align-items-center">
            <div class="col-auto fs-35 pr-0">
              <i class="fad fa-user-circle"></i>
            </div>
            <div class="col">
              <div class="row">
                <div class="col-12 text-warning pr-0 font-weight-bold">${user.username} | ${user.team}</div>
                <div class="col-12 bg-text fs-13">${user.email}</div>
              </div>
            </div>
            <div class="col-auto fs-30 pr-0">
              <i class="fal fa-plus-circle"></i>
              <i onclick="deletediv(this,'${user.id}')" class="fal fa-times-circle text-danger"></i>
            </div>
          </div>`;
          option += `<li class="pointer" onclick="set_item('${user.id}')" id="userid-${user.id}">${showname}</li>`;
        }
      }
      res.send(option);
    } catch (error) {
      req.flash("error", "Something went wrong please try again");
      res.redirect("/");
    }
  }

  async sendPushNotification(req, res, next) {
    try {
      res.locals.message = req.flash();
      res.render("notification/pushNotifications", {
        sessiondata: req.session.data,
      });
    } catch {
      req.flash("error", "Something went wrong please try again");
      res.redirect("/");
    }
  }

  async sendPushNotificationData(req, res, next) {
    try {
      res.locals.message = req.flash();
      let data = await notificationServices.sendPushNotification(req);
      if (data === true) {
        req.flash("success", 'Push Notification Send Successfully!');
        res.redirect("/push-notification");
      } else {
        req.flash("error", 'Push Notification Did Not Send Successfully!');
        res.redirect("/push-notification");
      }
    } catch {
      req.flash("error", "Something went wrong please try again");
      res.redirect("/");
    }
  }

  async sendEmailNotification(req, res, next) {
    try {
      res.locals.message = req.flash();
      res.render("notification/emailNotifications", {
        sessiondata: req.session.data,
      });
    } catch {
      req.flash("error", "Something went wrong please try again");
      res.redirect("/");
    }
  }

  async sendEmailNotificationData(req, res, next) {
    try {
      res.locals.message = req.flash();
      let data = await notificationServices.sendEmailNotification(req);
      if (data === true) {
        req.flash("success", 'Email Notification Send Successfully!');
        res.redirect("/email-notification");
      } else {
        req.flash("error", 'Email Notification Did Not Send Successfully!');
        res.redirect("/email-notification");
      }
    } catch {
      req.flash("error", "Something went wrong please try again");
      res.redirect("/");
    }
  }
  async smsNotification(req,res,next){
    try{
        res.locals.message = req.flash();
        res.render("notification/smsNotifications", {
          sessiondata: req.session.data,
        });
      } catch {
        req.flash("error", "Something went wrong please try again");
        res.redirect("/");
      }
  }
  async smsNotificationData(req,res,next){
    try{
        res.locals.message = req.flash();
      let data = await notificationServices.smsNotificationData(req);
      if (data === true) {
        req.flash("success", 'SMS Notification Send Successfully!');
        res.redirect("/sms-notification");
      } else {
        req.flash("error", 'SMS Notification Did Not Send Successfully!');
        res.redirect("/sms-notification");
      }
    } catch {
      req.flash("error", "Something went wrong please try again");
      res.redirect("/");
    }
  }
}
module.exports = new notificationController();
