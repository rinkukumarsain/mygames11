const userServices = require('../services/userServices');

class userController {
    constructor() {
        return {
            addTempuser: this.addTempuser.bind(this),
            registerUser: this.registerUser.bind(this),
            loginuser: this.loginuser.bind(this),
            loginuserOTP: this.loginuserOTP.bind(this),
            getVersion: this.getVersion.bind(this),
            getmainbanner: this.getmainbanner.bind(this),
            getwebslider: this.getwebslider.bind(this),
            uploadUserImage: this.uploadUserImage.bind(this),
            resendOTP: this.resendOTP.bind(this),
            verifyMobileNumber: this.verifyMobileNumber.bind(this),
            verifyEmail: this.verifyEmail.bind(this),
            verifyCode: this.verifyCode.bind(this),
            allverify: this.allverify.bind(this),
            userFullDetails: this.userFullDetails.bind(this),
            logoutUser: this.logoutUser.bind(this),
            myTransactions: this.myTransactions.bind(this),
            editProfile: this.editProfile.bind(this),
            forgotPassword: this.forgotPassword.bind(this),
            matchCodeForReset: this.matchCodeForReset.bind(this),
            resetPassword: this.resetPassword.bind(this),
            changePassword: this.changePassword.bind(this),
            panRequest: this.panRequest.bind(this),
            panDetails: this.panDetails.bind(this),
            bankRequest: this.bankRequest.bind(this),
            bankDetails: this.bankDetails.bind(this),
            getBalance: this.getBalance.bind(this),
            myWalletDetails: this.myWalletDetails.bind(this),
            requestWithdraw: this.requestWithdraw.bind(this),
            myWithdrawList: this.myWithdrawList.bind(this),
            requestAddCash: this.requestAddCash.bind(this),
            webhookDetail: this.webhookDetail.bind(this),
            socialAuthentication: this.socialAuthentication.bind(this),
            getNotification: this.getNotification.bind(this),
            getOffers: this.getOffers.bind(this),
            getYoutuberProfit:this.getYoutuberProfit.bind(this),
        }
    }

    async addTempuser(req, res, next) {
        try {
            const data = await userServices.addTempuser(req);
            return res.status(200).json(Object.assign({ success: data.status }, data));
        } catch (error) {
            next(error);
        }
    }

    async registerUser(req, res, next) {
        try {
            const data = await userServices.registerUser(req);
            return res.status(200).json(Object.assign({ success: data.status }, data));
        } catch (error) {
            next(error);
        }
    }

    async loginuser(req, res, next) {
        try {
            const data = await userServices.loginuser(req);
            return res.status(200).json(Object.assign({ success: data.status }, data));
        } catch (error) {
            next(error);
        }
    }

    async logoutUser(req, res, next) {
        try {
            const data = await userServices.logoutUser(req);
            return res.status(200).json(Object.assign({ success: data.status }, data));
        } catch (error) {
            next(error);
        }
    }

    async loginuserOTP(req, res, next) {
        try {
            const data = await userServices.loginuserOTP(req);
            return res.status(200).json(Object.assign({ success: data.status }, data));
        } catch (error) {
            next(error);
        }
    }

    async getVersion(req, res, next) {
        try {
            const data = await userServices.getVersion(req);
            return res.status(200).json(Object.assign({ success: data.status }, data));
        } catch (error) {
            next(error);
        }
    }


    async getmainbanner(req, res, next) {
        try {
            const data = await userServices.getmainbanner(req);
            return res.status(200).json(Object.assign({ success: true }, data));
        } catch (error) {
            next(error);
        }
    }

    async getwebslider(req, res, next) {
        try {
            const data = await userServices.getwebslider(req);
            return res.status(200).json(Object.assign({ success: true }, data));
        } catch (error) {
            next(error);
        }
    }

    async uploadUserImage(req, res, next) {
        try {
            const data = await userServices.uploadUserImage(req);
            return res.status(200).json(Object.assign({ success: true }, data));
        } catch (error) {
            next(error);
        }
    }

    async resendOTP(req, res, next) {
        try {
            const data = await userServices.resendOTP(req);
            return res.status(200).json(Object.assign({ success: data.status }, data));
        } catch (error) {
            next(error);
        }
    }

    async verifyMobileNumber(req, res, next) {
        try {
            const data = await userServices.verifyMobileNumber(req);
            return res.status(200).json(Object.assign({ success: data.status }, data));
        } catch (error) {
            next(error);
        }
    }

    async verifyEmail(req, res, next) {
        try {
            const data = await userServices.verifyEmail(req);
            return res.status(200).json(Object.assign({ success: data.status }, data));
        } catch (error) {
            next(error);
        }
    }

    async verifyCode(req, res, next) {
        try {
            const data = await userServices.verifyCode(req);
            return res.status(200).json(Object.assign({ success: data.status }, data));
        } catch (error) {
            next(error);
        }
    }

    async allverify(req, res, next) {
        try {
            const data = await userServices.allverify(req);
            return res.status(200).json(Object.assign({ success: true }, data));
        } catch (error) {
            next(error);
        }
    }

    async userFullDetails(req, res, next) {
        try {
            const data = await userServices.userFullDetails(req);
            return res.status(200).json(Object.assign({ success: true }, data));
        } catch (error) {
            next(error);
        }
    }

    async myTransactions(req, res, next) {
        try {
            const data = await userServices.myTransactions(req);
            return res.status(200).json(Object.assign({ success: data.status }, data));
        } catch (error) {
            next(error);
        }
    }

    async editProfile(req, res, next) {
        try {
            const data = await userServices.editProfile(req);
            return res.status(200).json(Object.assign({ success: data.status }, data));
        } catch (error) {
            next(error);
        }
    }

    async forgotPassword(req, res, next) {
        try {
            const data = await userServices.forgotPassword(req);
            return res.status(200).json(Object.assign({ success: data.status }, data));
        } catch (error) {
            next(error);
        }
    }

    async matchCodeForReset(req, res, next) {
        try {
            const data = await userServices.matchCodeForReset(req);
            return res.status(200).json(Object.assign({ success: data.status }, data));
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const data = await userServices.resetPassword(req);
            return res.status(200).json(Object.assign({ success: data.status }, data));
        } catch (error) {
            next(error);
        }
    }

    async changePassword(req, res, next) {
        try {
            const data = await userServices.changePassword(req);
            return res.status(200).json(Object.assign({ success: data.status }, data));
        } catch (error) {
            next(error);
        }
    }

    async panRequest(req, res, next) {
        try {
            const data = await userServices.panRequest(req);
            return res.status(200).json(Object.assign({ success: true }, data));
        } catch (error) {
            next(error);
        }
    }

    async bankRequest(req, res, next) {
        try {
            const data = await userServices.bankRequest(req);
            return res.status(200).json(Object.assign({ success: true }, data));
        } catch (error) {
            next(error);
        }
    }

    async panDetails(req, res, next) {
        try {
            const data = await userServices.panDetails(req);
            return res.status(200).json(Object.assign({ success: true }, data));
        } catch (error) {
            next(error);
        }
    }

    async bankDetails(req, res, next) {
        try {
            const data = await userServices.bankDetails(req);
            return res.status(200).json(Object.assign({ success: true }, data));
        } catch (error) {
            next(error);
        }
    }

    async getBalance(req, res, next) {
        try {
            const data = await userServices.getBalance(req);
            return res.status(200).json(Object.assign({ success: true }, data));
        } catch (error) {
            next(error);
        }
    }

    async myWalletDetails(req, res, next) {
        try {
            const data = await userServices.myWalletDetails(req);
            return res.status(200).json(Object.assign({ success: true }, data));
        } catch (error) {
            next(error);
        }
    }

    async requestWithdraw(req, res, next) {
        try {
            const data = await userServices.requestWithdraw(req);
            return res.status(200).json(Object.assign({ success: true }, data));
        } catch (error) {
            next(error);
        }
    }

    async myWithdrawList(req, res, next) {
        try {
            const data = await userServices.myWithdrawList(req);
            return res.status(200).json(Object.assign({ success: true }, data));
        } catch (error) {
            next(error);
        }
    }

    async requestAddCash(req, res, next) {
        try {
            const data = await userServices.requestAddCash(req);
            return res.status(200).json(Object.assign({ success: data.status }, data));
        } catch (error) {
            next(error);
        }
    }

    async webhookDetail(req, res, next) {
        try {
            const data = await userServices.webhookDetail(req);
            return res.status(200).json(Object.assign({ success: data.status }, data));
        } catch (error) {
            next(error);
        }
    }

    async socialAuthentication(req, res, next) {
        try {
            const data = await userServices.socialAuthentication(req);
            return res.status(200).json(Object.assign({ success: data.status }, data));
        } catch (error) {
            next(error);
        }
    }

    async getNotification(req, res, next) {
        try {
            const data = await userServices.getNotification(req);
            return res.status(200).json(Object.assign({ success: data.status }, data));
        } catch (error) {
            next(error);
        }
    }

    async getOffers(req, res, next) {
        try {
            const data = await userServices.getOffers(req);
            return res.status(200).json(Object.assign({ success: data.status }, data));
        } catch (error) {
            next(error);
        }
    }
    async getYoutuberProfit(req,res,next){
        try{
            const data=await userServices.getYoutuberProfit(req);
            return res.status(200).json(Object.assign({ success: data.status }, data));
        }catch(error){
            next(error);
        }
    }
}
module.exports = new userController();