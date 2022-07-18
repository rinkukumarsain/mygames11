const adminModel = require('../../models/adminModel');

class activateDeactivateBotService {
    constructor() {
        return {
            acivateBotUser: this.acivateBotUser.bind(this),
            deactivateBotUser: this.deactivateBotUser.bind(this)
        }
    }

    async acivateBotUser(req) {
        try {
            const updateData = await adminModel.updateOne({role: '0'}, {is_active: true}, {new: true});
            if(updateData.modifiedCount === 1) {
                return {
                    status: true,
                    data: {}
                }
            } else {
                return {
                    status: false,
                    data: {}
                }
            }
        } catch (error) {
            throw error;
        }
    }

    async deactivateBotUser(req) {
        try {
            const updateData = await adminModel.updateOne({role: '0'}, {is_active: false}, {new: true});
            if(updateData.modifiedCount === 1) {
                return {
                    status: true,
                    data: {}
                }
            } else {
                return {
                    status: false,
                    data: {}
                }
            }
        } catch (error) {
            throw error;
        }
    }

}

module.exports = new activateDeactivateBotService();