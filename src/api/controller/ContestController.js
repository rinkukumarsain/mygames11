const contestservices = require('../services/contestServices');

class contestController {
    constructor() {
        return {
            getAllContests: this.getAllContests.bind(this),
            getContest: this.getContest.bind(this),
            joinContest: this.joinContest.bind(this),
            myJoinedContests: this.myJoinedContests.bind(this),
            myLeaderboard: this.myLeaderboard.bind(this),
            updateJoinedusers: this.updateJoinedusers.bind(this),
            switchTeams: this.switchTeams.bind(this),
            getUsableBalance: this.getUsableBalance.bind(this),
            getAllContestsWithoutCategory: this.getAllContestsWithoutCategory.bind(this),
            createPrivateContest: this.createPrivateContest.bind(this),
            joinContestByCode: this.joinContestByCode.bind(this)
        }
    }

    async getAllContests(req, res, next) {
        try {
            // contestservices.getAllContests(req);
            const data = await contestservices.getAllContests(req);
            // console.log(`data`, data);
            if (data.status === false) {
                return res.status(200).json(Object.assign({ success: true }, data));
            } else {
                return res.status(200).json(Object.assign({ success: true }, data));
            }
        } catch (error) {
            next(error);
        }
    }

    async getContest(req, res, next) {
        try {
            const data = await contestservices.getContest(req);
            if (data.status === false) {
                return res.status(200).json(Object.assign({ success: true }, data));
            } else {
                return res.status(200).json(Object.assign({ success: true }, data));
            }
        } catch (error) {
            next(error);
        }
    }

    async joinContest(req, res, next) {
        try {
            // console.log(`here`, req.user._id);
            const data = await contestservices.joinContest(req);
            if (data.status === false) {
                return res.status(200).json(Object.assign({ success: data.status }, data));
            } else {
                return res.status(200).json(Object.assign({ success: true }, data));
            }
        } catch (error) {
            next(error);
        }
    }

    async myJoinedContests(req, res, next) {
        try {
            // console.log(`here`, req.user._id);
            const data = await contestservices.myJoinedContests(req);
            if (data.status === false) {
                return res.status(200).json(Object.assign({ success: data.status }, data));
            } else {
                return res.status(200).json(Object.assign({ success: true }, data));
            }
        } catch (error) {
            next(error);
        }
    }

    async myLeaderboard(req, res, next) {
        try {
            // console.log(`here`, req.user._id);
            const data = await contestservices.myLeaderboard(req);
            return res.status(200).json(Object.assign({ success: true }, data));
        } catch (error) {
            next(error);
        }
    }

    async updateJoinedusers(req, res, next) {
        try {
            // console.log(`here`, req.user._id);
            const data = await contestservices.updateJoinedusers(req);
            if (data.status === false) {
                return res.status(200).json(Object.assign({ success: data.status }, data));
            } else {
                return res.status(200).json(Object.assign({ success: true }, data));
            }
        } catch (error) {
            next(error);
        }
    }

    async switchTeams(req, res, next) {
        try {
            // console.log(`here`, req.user._id);
            const data = await contestservices.switchTeams(req);
            if (data.status === false) {
                return res.status(200).json(Object.assign({ success: data.status }, data));
            } else {
                return res.status(200).json(Object.assign({ success: true }, data));
            }
        } catch (error) {
            next(error);
        }
    }

    async getUsableBalance(req, res, next) {
        try {
            // console.log(`here`, req.user._id);
            const data = await contestservices.getUsableBalance(req);
            return res.status(200).json(Object.assign({ success: true }, data));
        } catch (error) {
            next(error);
        }
    }

    async getAllContestsWithoutCategory(req, res, next) {
        try {
            // console.log(`here`, req.user._id);
            const data = await contestservices.getAllContestsWithoutCategory(req);
            return res.status(200).json(Object.assign({ success: true }, data));
        } catch (error) {
            next(error);
        }
    }
    async createPrivateContest(req, res, next) {
        try {
            // console.log(`here`, req.user._id);
            const data = await contestservices.createPrivateContest(req);
            return res.status(200).json(Object.assign({ success: true }, data));
        } catch (error) {
            next(error);
        }
    }

    async joinContestByCode(req, res, next) {
        try {
            // console.log(`here`, req.user._id);
            const data = await contestservices.joinContestByCode(req);
            return res.status(200).json(Object.assign({ success: data.status }, data));
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new contestController();