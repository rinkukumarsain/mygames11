const contestCategoryService = require('../services/contestCategoryService');
const mongoose = require("mongoose");
const contestCategoryModel = require("../../models/contestcategoryModel");

class contestCategory {
    constructor() {
        return {
            contestCategoryPage: this.contestCategoryPage.bind(this),
            createContestCategory: this.createContestCategory.bind(this),
            addContestCategoryData: this.addContestCategoryData.bind(this),
            contestCategoryTable: this.contestCategoryTable.bind(this),
            editContestCategory:this.editContestCategory.bind(this),
            deleteContestCategory:this.deleteContestCategory.bind(this),
            editContestCategoryData:this.editContestCategoryData.bind(this),
           

        }
    }
    async contestCategoryPage(req, res, next) {
        try {
            res.locals.message = req.flash();
            let name=req.query.name;
            // console.log("name.............................................",req.query.name)
            res.render("contest/viewContestCategory",{ sessiondata: req.session.data, name});

        } catch (error) {
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/");
        }
    }
    async createContestCategory(req, res, next) {
        try {
            res.locals.message = req.flash();
            res.render("contest/createContestCategory", {sessiondata: req.session.data, });

        } catch (error) {
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/view-contest-Category");
        }
    }
    async addContestCategoryData(req, res, next) {
        try {

            res.locals.message = req.flash();
            const postData = await contestCategoryService.addContestCategoryData(req);
            if (postData) {
                res.redirect("/view-contest-Category");
            }

        } catch (error) {
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/create-contest-category");
        }
    }
    async editContestCategoryData(req, res, next) {
        try {
            res.locals.message = req.flash();
            const updateData = await contestCategoryService.editContestCategoryData(req);
           if(updateData.status == true){
                req.flash('success',updateData.message);
                res.redirect('/view-contest-Category')
           }else if(updateData.status == false){
            req.flash('error',updateData.message);
            res.redirect(`/edit-contest-category?contestCatId=${req.params.contestId}`)
           }

        } catch (error) {
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/view-contest-Category");
        }
    }
    async contestCategoryTable(req, res, next) {
        try {

            let limit1 = req.query.length;
            let start = req.query.start;
            let sortObject = {},
                dir, join

            let conditions = {};
            if(req.query.searchName){
                
                let searchName=req.query.searchName;
                conditions.name= { $regex: new RegExp("^" + searchName.toLowerCase(), "i") } 
            }
            contestCategoryModel.countDocuments(conditions).exec((err, rows) => {
                let totalFiltered = rows;
                let data = [];
                let count = 1;
                contestCategoryModel.find(conditions).skip(Number(start) ? Number(start) : '').limit(Number(limit1) ? Number(limit1) : '').sort(sortObject).exec(async(err, rows1) => {
                 
                    if (err) console.log(err);
                    rows1.forEach((index) => {
                        let image
                        if(index.image){
                            image=`<img src="${index.image}" class="w-40px view_team_table_images h-40px rounded-pill">`
                        }else{
                            image=`<img src="/uploadImage/defaultImage.jpg" class="w-40px view_team_table_images h-40px rounded-pill">`
                        }
                        data.push({
                            'count': count,
                            'name':index.name,
                            'sub_title':index.sub_title,
                            'image': image,
                            'action':` <a class="btn w-35px h-35px mr-1 btn-orange text-uppercase btn-sm"
                            data-toggle="tooltip" title="Edit"
                            href="/edit-contest-category?contestCatId=${index._id}"><i class="fas fa-pencil"></i>
                        </a>
                        <a class="btn w-35px h-35px mr-1 btn-danger text-uppercase btn-sm"
                            data-toggle="tooltip" title="Delete"
                            onclick="delete_sweet_alert('/delete-contest-category?contestCatId=${index._id}', 'Are you sure you want to delete this data?')">
                            <i class="far fa-trash-alt"></i>
                        </a>`
                        });
                        count++;

                        if (count > rows1.length) {
                            let json_data = JSON.stringify({
                                "recordsTotal": rows,
                                "recordsFiltered": totalFiltered,
                                "data": data
                            });
                            res.send(json_data);

                        }
                    });
                });
            });



        } catch (error) {
             next(error);
        }
    }
    async editContestCategory(req,res,next){
        try{
            res.locals.message = req.flash();
            const editContestCat=await contestCategoryService.editContestCategory(req);
            if(editContestCat){
                res.render("contest/editContestCategory",{ sessiondata: req.session.data, data:editContestCat})
            }

        }catch(error){
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/view-contest-Category");
        }
    }
    async deleteContestCategory(req,res,next){
        try{
            res.locals.message = req.flash();
            const deleteContestCat=await contestCategoryService.deleteContestCategory(req);
            if(deleteContestCat){
                res.redirect('/view-contest-Category')
            }

        }catch(error){
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/view-contest-Category");
        }
    }
   


}
module.exports = new contestCategory();