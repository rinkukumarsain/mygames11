const FCM = require('fcm-node');
const constant = require('../config/const_credential');
const fcmServerKey = constant.FCM_SERVER_KEY; // put your server key here
const fcm = new FCM(fcmServerKey);
let fcm_fun = {
    sendPush: async(message) => {
        return new Promise((resolve, reject) => {
            try {
                fcm.send(message, function(error, response) {
                    if (error) {
                        console.log(error);
                        resolve(error);
                    } else {
                        resolve(response);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    },
    subscribeToTopic: async(deviceIds, payload) => {
        return new Promise((resolve, reject) => {
            try {
                fcm.subscribeToTopic(deviceIds, 'some_topic_name', (err, res) => {
                    console.log(err, res);
                });
            } catch (error) {
                reject(error);
            }
        });
    },
    unsubscribeToTopic: async(deviceIds, payload) => {
        return new Promise((resolve, reject) => {
            try {
                fcm.unsubscribeToTopic(deviceIds, 'some_topic_name', (err, res) => {
                    console.log(err, res);
                });
            } catch (error) {
                reject(error);
            }
        });
    }
}
module.exports = fcm_fun;