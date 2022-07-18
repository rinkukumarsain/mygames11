const activateDeactivateBotService = require('../services/activateDeactivateBotService');

class activateDeactivateBotController {
    constructor() {
        return {
            acivateBotUser: this.acivateBotUser.bind(this),
            deactivateBotUser: this.deactivateBotUser.bind(this)
        }
    }

    async acivateBotUser(req, res, next) {
        try {
            const active = await activateDeactivateBotService.acivateBotUser(req);
            if(active) {
                res.redirect("/")
            }
        } catch (error) {
            throw error;
        }
    }

    async deactivateBotUser(req, res, next) {
        try {
            const deactive = await activateDeactivateBotService.deactivateBotUser(req);
            if(deactive) {
                res.redirect("/")
            }
        } catch (error) {
            throw error;
        }
    }

}

module.exports = new activateDeactivateBotController();