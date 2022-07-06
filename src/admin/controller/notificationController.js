
const moment = require("moment");
const mongoose = require("mongoose");

class notificationController {
    constructor() {
        return {
            pushNotification: this.pushNotification.bind(this),
            emailNotification:this.emailNotification.bind(this),
            
        }
    }
    async pushNotification(req, res, next) {
        try {
            res.locals.message = req.flash();
            res.render('notification/pushNotifications', { sessiondata: req.session.data });
        } catch {
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/");
        }
    }
    async emailNotification(req, res, next) {
        try {
            res.locals.message = req.flash();
            res.render('notification/emailNotifications', { sessiondata: req.session.data });
        } catch {
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/");
        }
    }
   


}
module.exports = new notificationController();