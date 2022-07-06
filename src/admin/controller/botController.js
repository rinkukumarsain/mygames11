const botServices = require('../services/botservices');
const listMatchesModel = require('../../models/listMatchesModel');

class botController {
    constructor() {
        return {
           
            createMyTeam: this.createMyTeam.bind(this),
        }
    }
    async createMyTeam(req, res, next) {
        try {
            
            const data = await botServices.createMyTeam(req);
            if (data.status === false) {
                return res.status(400).json(Object.assign({ success: data.status }, data));
            } else {
                return res.status(200).json(Object.assign({ success: data.status }, data));
            }
        } catch (error) {
            next(error);
        }
    }
}
module.exports = new botController();