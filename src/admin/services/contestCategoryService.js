const res = require('express/lib/response');
const mongoose = require('mongoose');
const randomstring = require("randomstring");

const contestCategoryModel = require("../../models/contestcategoryModel");

class contestCategory {
    constructor() {
        return {
            addContestCategoryData: this.addContestCategoryData.bind(this),
            editContestCategory: this.editContestCategory.bind(this),
            deleteContestCategory: this.deleteContestCategory.bind(this),
            editContestCategoryData:this.editContestCategoryData.bind(this),
            
        }
    }
    // --------------------
    async addContestCategoryData(req) {
        try {
            console.log("....contest category.......", req.body, req.file)
            let insertObj = {
                name: req.body.name,
                sub_title: req.body.sub_title,
            }
            if (req.file) {
                insertObj.image = `/${req.body.typename}/${req.file.filename}`
            }
            const addContestCategory = new contestCategoryModel(insertObj);
            let saveContest = await addContestCategory.save();
            if (saveContest) {
                return true;
            }

        } catch (error) {
            throw error;
        }
    }
    async editContestCategoryData(req) {
        try {
            const checkcontestCat=await contestCategoryModel.findOne({_id:req.params.contestId});
            if(checkcontestCat){
                const checkName=await contestCategoryModel.findOne({_id:{$ne:req.params.contestId},name:req.body.name});
                if(checkName){
                    return{
                        status:false,
                        message:'contest name already exites'
                    }
                    
                }else{
                    console.log("....contest category.......", req.body, req.file)
                    let insertObj = {
                        name: req.body.name,
                        sub_title: req.body.sub_title,
                    }
                    if (req.file) {
                        insertObj.image = `/${req.body.typename}/${req.file.filename}`
                    }
                    if(req.file){
                        if(checkcontestCat.image){
                            let fs = require('fs');
                            let filePath = `public${checkcontestCat.image}`;
                            if(fs.existsSync(filePath) == true){
                                fs.unlinkSync(filePath);
                            }
                        }
                    }
                    const addContestCategory =await contestCategoryModel.updateOne({_id:req.params.contestId},{
                        $set:insertObj
                    })
                    if(addContestCategory.modifiedCount == 1){
                        return{
                            status:true,
                            message:'contest successfully update'
                        }
                    }else{
                        return{
                            status:false,
                            message:'contest not update..error..'
                        }
                    }
                    
                }
                

            }else{
                return{
                    status:false,
                    message:'Invalid Contest Id..'
                }
            }
            

        } catch (error) {
            throw error;
        }
    }
    async editContestCategory(req) {
        try {
            const getEditData = await contestCategoryModel.findOne({ _id: req.query.contestCatId })
            if (getEditData) {
                return getEditData;
            }

        } catch (error) {
            throw error;
        }
    }
    async deleteContestCategory(req) {
        try {
            const getImg = await contestCategoryModel.findOne({ _id: req.query.contestCatId });
            if (getImg.image) {
                let fs = require('fs');
                let filePath = `public/${getImg.image}`;
                if(fs.existsSync(filePath) == true){
                    fs.unlinkSync(filePath);
                }
            }

            const deleteBanner = await contestCategoryModel.deleteOne({ _id: req.query.contestCatId });
            console.log("deleteBanner.........", deleteBanner)
            if (deleteBanner) {
                return true;
            }

        } catch (error) {
            throw error;
        }
    }
   


}
module.exports = new contestCategory();