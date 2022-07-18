const mongoose = require('mongoose');
const userModel = require('../../models/userModel');
const notification = require("../../utils/notifications");
const sendgrid = require('@sendgrid/mail');

const constant = require('../../config/const_credential');
sendgrid.setApiKey(constant.SENDGRID_API_KEY);

class notificationServices {
    constructor() {
        return {
            getUser: this.getUser.bind(this),
            sendPushNotification: this.sendPushNotification.bind(this),
            sendEmailNotification: this.sendEmailNotification.bind(this),
            emailNotification: this.emailNotification.bind(this),
            smsNotificationData:this.smsNotificationData.bind(this),
        }
    }

    async getUser(query) {
        try {
            return await userModel.find(query)
        } catch (error) {
            throw error;
        }
    }
    async emailNotification(email, subject, message) {
        let msg = {
            from: {
                name: constant.APP_NAME,
                email: constant.SENDGRID_EMAIL
            },
            to: email,
            subject: subject,
            html: `<strong>${message}</strong>`,
        }
        sendgrid
            .send(msg)
            .then((response) => {
                console.log('mail sent...');
                console.log(response[0].statusCode)
                console.log(response[0].headers)
            })
            .catch((error) => {
                console.error(error)
            })
    }

    async sendPushNotification(req) {
        try {
            let receiverId = [];
            let entityId = [];
            let appKey = [];
            const notificationObject = {
                type: 'Admin Notification',
                title: req.body.title,
                message: req.body.message,
            };
            if (req.body.usertype === 'specific') {
                let uservalues = req.body.uservalues.split(',');
                for (let id of uservalues) {
                    let user = await this.getUser({ _id: mongoose.Types.ObjectId(id) });
                    appKey.push(user[0].app_key);
                    receiverId.push(user[0]._id);
                    entityId.push(user[0]._id);
                }
            }
            if (req.body.usertype === 'all') {
                let user = await this.getUser({ app_key: { $ne: '' } });
                for (let memb of user) {
                    appKey.push(memb.app_key);
                    receiverId.push(memb._id);
                    entityId.push(memb._id);
                }
            }
            notificationObject.receiverId = receiverId;
            notificationObject.entityId = entityId;
            notificationObject.deviceTokens = appKey;
            notification.PushAllNotifications(notificationObject);
            return true;
        } catch (error) {
            throw error;
        }
    }

    async sendEmailNotification(req) {
        try {
            if (req.body.usertype === 'specific') {
                let uservalues = req.body.uservalues.split(',');
                for (let id of uservalues) {
                    let user = await this.getUser({ _id: mongoose.Types.ObjectId(id) });
                    this.emailNotification(user[0].email, req.body.title, req.body.message)
                }
            }
            if (req.body.usertype === 'all') {
                let user = await this.getUser({ user_status: 0 });
                for (let memb of user) {
                    this.emailNotification(memb.email, req.body.title, req.body.message)
                }
            }
            return true;
        } catch (error) {
            throw error;
        }
    }
    async smsNotificationData(req){
        try{
            // if (req.body.usertype === 'specific') {
            //     let uservalues = req.body.uservalues.split(',');
            //     for (let id of uservalues) {
            //         let user = await this.getUser({ _id: mongoose.Types.ObjectId(id) });
            //         this.emailNotification(user[0].email, req.body.title, req.body.message)
            //     }
            // }
            // if (req.body.usertype === 'all') {
            //     let user = await this.getUser({ user_status: 0 });
            //     for (let memb of user) {
            //         this.emailNotification(memb.email, req.body.title, req.body.message)
            //     }
            // }
            return true;

        }catch(error){
            throw error;
        }
    }
}
module.exports = new notificationServices();