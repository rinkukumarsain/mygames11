const adminModel = require('../../models/adminModel');

const config = require("../../config/const_credential");
const fs = require('fs');

class popupNotificationService {
    constructor() {
        return {
            addPopupData: this.addPopupData.bind(this),
            deletePopup: this.deletePopup.bind(this),
        }
    }

    async addPopupData(req) {
        try {
            if(req.fileValidationError){
                return{
                    status:false,
                    message:req.fileValidationError
                }

            }else{
            // const image = `${process.env.BASE_URL_LOCAL}${req.body.typename}/${req.file.filename}`;
            let doc = req.body;
            if(req.file) {
                doc.image = `/${req.body.typename}/${req.file.filename}`;
                let admin = await adminModel.findOne({ role: '0' });
                if(admin.popup_notify_image) {
                    let filePath = `public${admin.popup_notify_image}`;
                    if(fs.existsSync(filePath)){
                        fs.unlinkSync(filePath)
                    }
                }
            }
            const payload = await adminModel.updateOne({ role:'0' }, { popup_notify_image: doc.image, popup_notify_title: doc.title }, { new: true });
            
            if(payload.modifiedCount > 0){
                return {
                    message: "popup notificatiion image updated successfully....!",
                    status: true,
                };
            }else{
                let filePath = `public/${req.body.typename}/${req.file.filename}`;
                if(fs.existsSync(filePath) == true){
                    fs.unlinkSync(filePath);
                } 
                return {
                    message: "popup notificatiion image not update...error.!",
                    status: false,
                };
            }
        }
        } catch (error) {
            throw error;
        }
    }

    async deletePopup(req) {
        try {
            let admin = await adminModel.findOne({ role: '0' });
            if(admin.popup_notify_image) {
                let filePath = `public${admin.popup_notify_image}`;
                console.log('filePath', filePath)
                if(fs.existsSync(filePath)){
                    fs.unlinkSync(filePath)
                }
            }
            const payload = await adminModel.updateOne({ role: '0' }, {popup_notify_image: '',popup_notify_title:''}, {new: true});
            if(payload.modifiedCount == 1){
                return {
                    message: "popup notificatiion image deleted successfully....!",
                    status: true,
                };
            }else{
                return {
                    message: "popup notificatiion image not deleted...error.!",
                    status: false,
                };
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new popupNotificationService();