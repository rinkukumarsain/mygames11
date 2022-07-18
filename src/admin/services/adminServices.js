const res = require('express/lib/response');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const adminModel = require('../../models/adminModel');

class adminServices {
    constructor() {
        return {
            registerAdminData: this.registerAdminData.bind(this),
            // adminLogin: this.adminLogin.bind(this),
            loginAdminData: this.loginAdminData.bind(this),
            changePasswordData: this.changePasswordData.bind(this),
            updateProfileData:this.updateProfileData.bind(this),
            // ------------------------------------
            addGenralTab: this.addGenralTab.bind(this),
            generalTabs: this.generalTabs.bind(this),
            generalTabDelete: this.generalTabDelete.bind(this),
            addBanner: this.addBanner.bind(this),
            editSideBanner: this.editSideBanner.bind(this),
            editBannerData: this.editBannerData.bind(this),
            deleteSideBanner: this.deleteSideBanner.bind(this),
        }
    }
    async registerAdminData(req) {
        try {
            const checkMailId = await adminModel.findOne({ email: req.body.email });
            // console.log("checkMailId....",checkMailId)
            if (checkMailId) {
                return {
                    status: false,
                    message: 'Email Id already Register'
                }
            } else {
                let androidVer = {}
                androidVer.updation_points = '<p>mygame11</p>'
                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(req.body.password, salt);
                const inserAdmin = new adminModel({
                    name: req.body.name,
                    email: req.body.email,
                    password: hash,
                    androidversion: androidVer
                })
                let saveAdmin = await inserAdmin.save();
                if (saveAdmin) {
                    return {
                        message: "register successfully",
                        status: true
                    }
                }

            }

        } catch (error) {
            throw error;
        }
    }

    async loginAdminData(req) {
        try {
            let whereObj = {
                is_deleted: false,
                email: req.body.email,
            }
            const data = await adminModel.find(whereObj);
            if (data.length == 0) {
                return {
                    message: " Email ID not register ",
                    status: false
                };
            } else {
                const checkPass = bcrypt.compareSync(req.body.password, data[0].password);
                if (!checkPass) {
                    return {
                        message: " Invalid Login...",
                        status: false,
                    };
                } else {
                    return {
                        message: " Admin Login Successfully...",
                        status: true,
                        data: data,
                    };
                }
            }
        } catch (error) {
            throw error;
        }
    }
    async addGenralTab(req) {
        try {
            // console.log("req.body.........",req.body);
            let whereObj = {
                role: req.params.id,
                'general_tabs.type': req.body.type
            }
            console.log("whereObj.........", whereObj)
            const addData = await adminModel.findOne(whereObj);
            // console.log("addData....addData...............",addData);
            if (addData == null) {
                let doc = {
                    type: req.body.type,
                    amount: req.body.amount,

                };
                const updateData = await adminModel.updateOne({ role: req.params.id }, {
                    $push: {
                        'general_tabs': doc
                    }
                });
                if (updateData) {
                    // console.log("addAmount................",updateData)
                    return true;
                }
            } else {
                let type = req.body.type;
                const updateData = await adminModel.updateOne({ role: req.params.id, 'general_tabs.type': type }, {
                    $set: {
                        'general_tabs.$.amount': req.body.amount
                    }
                });
                if (updateData) {
                    // console.log("updateData .. updateData general Tab..",updateData)
                    return true;
                }
            }
        } catch (error) {
            throw error;
        }
    }
    async generalTabs(req) {
        try {
            const getGeneralTabArray = await adminModel.aggregate([{
                $project: { general_tabs: 1 }
            }])
            if (getGeneralTabArray) {
                return getGeneralTabArray;
            }

        } catch (error) {
            throw error;
        }
    }
    async generalTabDelete(req) {
        try {
            // console.log("req.params.........",req.query)
            const findData = await adminModel.find({ _id: req.query.Id });
            console.log("findData.", findData);
            let newData = [];
            for (let key of findData[0].general_tabs) {
                if ((key._id).toString() != (req.query.generalTabId).toString()) {
                    newData.push(key)
                }
            }
            // console.log("newData///////////////",newData)
            const deleteGeneralTb = await adminModel.updateOne({ _id: req.query.Id }, {
                $set: {
                    general_tabs: newData
                }
            })
            if (deleteGeneralTb) {
                // console.log("deleteGeneralTb..service........",deleteGeneralTb);
                return true;
            }

        } catch (error) {
            throw error;
        }
    }
    async addBanner(req) {
        try {
            if(req.fileValidationError){
                return{
                    status:false,
                    message:req.fileValidationError
                }

            }
            // console.log("addBanner.....serveice", req.body.adminId);
            let adminId = '0'
            let doc = req.body;
            delete doc.adminId;
            if (req.file) {
                doc.image = `/${doc.typename}/${req.file.filename}`;
            }
            delete doc.typename;
            console.log("doc.......", doc)
            // console.log('----------------------------------req.body', req.body);
            const addBannerData = await adminModel.updateOne({ role: adminId }, {
                $push: {
                    sidebanner: doc
                }
            });
            if (addBannerData.modifiedCount == 1) {
                return true;
            }

        } catch (error) {
            throw error;
        }
    }
    async editSideBanner(req) {
        try {
            // console.log("req edit params data", req.query);
            const data = await adminModel.findOne({ _id: req.query.Id });
            let arrayObj = [];
            for (let key of data.sidebanner) {
                if ((key._id).toString() == (req.query.bannerId).toString()) {
                    arrayObj.push(key)
                }
            }
            return arrayObj;

        } catch (error) {
            throw error;
        }
    }
    async editBannerData(req) {
        try {
            // console.log("req.body",req.body,req.file,req.query)
            if(req.fileValidationError){
                return{
                    status:false,
                    message:req.fileValidationError
                }

            }
            let image = `/${req.body.typename}/${req.file?.filename}` || "";
            console.log("image....", image);

            if (!req.file) {
                let get = await adminModel.findOne({ role: '0', 'sidebanner._id': req.query.id }, { 'sidebanner.$': 1 });
                // console.log('==========================',get.sidebanner[0].image);
                image = get.sidebanner[0].image
            } else {
                if (req.file) {
                    let get = await adminModel.findOne({ role: '0', 'sidebanner._id': req.query.id }, { 'sidebanner.$': 1 });
                    // console.log("get.sidebanner[0].image",get.sidebanner[0].image)
                    if (get.sidebanner[0].image) {
                        let fs = require('fs');
                        let filePath = `public${get.sidebanner[0].image}`;
                        if(fs.existsSync(filePath) == true){
                            fs.unlinkSync(filePath);
                        }
                    }
                }
            }
            let updateBanner
            if (req.body.bannerType == 'others') {
                updateBanner = await adminModel.updateOne({ 'sidebanner._id': req.query.id }, {
                    $set: {
                        'sidebanner.$.type': req.body.type,
                         'sidebanner.$.bannerType': req.body.bannerType,
                        'sidebanner.$.image': image,
                        'sidebanner.$.url': req.body.url
                    }
                })
            } else {
                updateBanner = await adminModel.updateOne({ 'sidebanner._id': req.query.id }, {
                    $set: {
                        'sidebanner.$.type': req.body.type,
                         'sidebanner.$.bannerType': req.body.bannerType,
                        'sidebanner.$.image': image,
                        'sidebanner.$.url': ''
                    }
                })
            }
            // console.log("updateBanner..........",updateBanner)
            if (updateBanner.modifiedCount == 1) {
                return true;
            }

        } catch (error) {
            throw error;
        }
    }
    async deleteSideBanner(req) {
        try {
            console.log("req.query...........", req.query.bannerId)
            const findBanner = await adminModel.findOne({ role: '0' });
            console.log("findBanner...........", findBanner);
            let newData = []
            for (let key of findBanner.sidebanner) {
                if ((key._id).toString() != (req.query.bannerId).toString()) {
                    newData.push(key)
                }
            }
            let get = await adminModel.findOne({ role: '0', 'sidebanner._id': req.query.bannerId }, { 'sidebanner.$': 1 });
            // console.log("get.sidebanner[0].image",get.sidebanner[0].image)
            if (get.sidebanner[0].image) {
                let fs = require('fs');
                let filePath = `public/${get.sidebanner[0].image}`;
                if(fs.existsSync(filePath) == true){
                    fs.unlinkSync(filePath);
                }
            }
            const deleteBanner = await adminModel.updateOne({ role: 0 }, {
                $set: {
                    sidebanner: newData
                }
            })
            if (deleteBanner.modifiedCount == 1) {
                return true;
            }

        } catch (error) {
            throw error;
        }
    }

    // ------------------------- change password ------------------------
    async changePasswordData(req) {
        try {
            // console.log('--------------------',req.session.data);
            const { current_password, new_password, confirm_password } = req.body;
            if (new_password !== confirm_password) {
                return {
                    message: 'Confirm password and new password are not matched.',
                    status: false,
                };
            }
            const user = await adminModel.findOne({ _id: req.session.data._id });
            console.log('==============', user);
            if (!user) {
                return {
                    message: 'Invalid Details.',
                    status: false,
                };
            }
            // const checkPass = bcrypt.compareSync(current_password, user.password);
            console.log('Compare ================',current_password,user.password,bcrypt.compareSync(current_password, user.password));
            if (!(bcrypt.compareSync(current_password, user.password))) {
                return {
                    message: 'Old password does not matched to previous password.',
                    status: false,
                };
            }
            let salt = bcrypt.genSaltSync(10);
            let password = bcrypt.hashSync(new_password, salt);
            const updateUser = await adminModel.findOneAndUpdate({ _id: req.session.data._id }, { password: password }, { new: true });
            return {
                message: 'Password Changed Successfully...!',
                status: true,
            }
        } catch (error) {
            throw error;
        }
    }
    async updateProfileData(req){
        try{
            console.log("filename.........",req.file)
            if(req.fileValidationError){
                return{
                    status:false,
                    message:req.fileValidationError
                }

            }else{
            if(req.body.name && req.body.email  &&  req.body.mobile && req.body.masterpassword){
                let obj=req.body
                const adminDatas=await adminModel.find({_id:req.params.id});
                if(adminDatas.length > 0){
                    if(req.file){
                        if(adminDatas[0].image){
                            let filePath = `public${adminDatas[0].image}`;
                            if(fs.existsSync(filePath) == true){
                                fs.unlinkSync(filePath);
                            } 
                        }
                        obj.image=`/${req.body.typename}/${req.file.filename}`
                    }
                 const updateAdminData=await adminModel.updateOne({_id:req.params.id},{
                     $set:obj
                 })
                 if(updateAdminData.modifiedCount > 0){
                     return{
                         status:true,
                         message:'admin data successfully update ,please login again--'
                     }
                 }else{
                    let filePath = `public/${req.body.typename}/${req.file.filename}`;
                    if(fs.existsSync(filePath) == true){
                        fs.unlinkSync(filePath);
                    } 
                    return{
                        status:false,
                        message:'admin data not update..error'
                    }
                 }


                }else{
                    let filePath = `public/${req.body.typename}/${req.file.filename}`;
                    if(fs.existsSync(filePath) == true){
                        fs.unlinkSync(filePath);
                    } 
                    return{
                        status:false,
                        message:'admin data not found ..error'
                    }
                }
            
            }else{
                let filePath = `public/${req.body.typename}/${req.file.filename}`;
                if(fs.existsSync(filePath) == true){
                    fs.unlinkSync(filePath);
                } 
                return{
                    status:false,
                    message:'please proper details..'
                }
            }
        }
        }catch(error){
            console.log(error);
        }
    }

}
module.exports = new adminServices();