const moment = require("moment");

const userModel = require("../../models/userModel");
const youtuberServices = require("../services/youtuberServices");

class youtuberController {
    constructor() {
        return {
            add_youtuber: this.add_youtuber.bind(this),
            add_youtuber_data: this.add_youtuber_data.bind(this),
            view_youtuber: this.view_youtuber.bind(this),
            view_youtuber_dataTable: this.view_youtuber_dataTable.bind(this),
            edit_youtuber:this.edit_youtuber.bind(this),
            edit_youtuber_data:this.edit_youtuber_data.bind(this),
            delete_youtuber:this.delete_youtuber.bind(this),
        }
    }

    async add_youtuber(req, res, next) {
        try {
            res.locals.message = req.flash();
            res.render('youtuber/addYoutuber',{sessiondata:req.session.data,data:undefined,msg:undefined})
            
        } catch (error) {
            // next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/");
        }
    }
    async add_youtuber_data(req, res, next) {
        try {
            res.locals.message = req.flash();
            const addData = await youtuberServices.add_youtuber_data(req);
            if (addData.status == true) {
                req.flash('success', addData.message);
                res.redirect('/add_youtuber')
            } else if (addData.status == false) {
                req.flash('error', addData.message);
                res.render('youtuber/addYoutuber', { sessiondata:req.session.data ,data: addData.data,msg:addData.message })
            }

        } catch (error) {
            // next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/add_youtuber");
        }
    }
    async view_youtuber(req, res, next) {
        try {
            res.locals.message = req.flash();
            let queryData
            if(req.query){
                queryData=req.query;
            }else{
                queryData=undefined;
            }
            console.log("queryData.........",queryData);
            res.render('youtuber/viewYoutuber',{sessiondata:req.session.data,queryData});

        } catch (error) {
            // next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/");
        }
    }
    async view_youtuber_dataTable(req, res, next) {
        try {
            console.log('req------DATATABLE-------controller',req.query);
            let limit1 = req.query.length;
            let start = req.query.start;
            let sortObject = {},
                dir, join
            let conditions = {};
            if (req.query.name) {
                conditions.username = { $regex: new RegExp("^" + req.query.name.toLowerCase(), "i") }
            }
            if (req.query.email) {
                conditions.email = { $regex: new RegExp("^" + req.query.email.toLowerCase(), "i") }
            }
            if (req.query.mobile) {
                conditions.mobile = req.query.mobile 
            }
            console.log("conditions.....", conditions);

            userModel.countDocuments(conditions).exec((err, rows) => {
                // console.log("rows....................",rows)
                let totalFiltered = rows;
                let data = [];
                let count = 1;
                userModel.find(conditions).skip(Number(start) ? Number(start) : '').limit(Number(limit1) ? Number(limit1) : '').exec(async (err, rows1) => {
                    if (err) console.log(err);
                    rows1.forEach((index) => {
                        data.push({
                            'count': count,
                            'username': index.username,
                            'email': index.email,
                            'mobile': index.mobile,
                            'decrypted_password': index?.decrypted_password,
                            'percentage': index.percentage,
                            'refer_code': index.refer_code,
                            'total_earned': 0,
                            'action': `<a class="btn w-35px h-35px mr-1 btn-orange text-uppercase btn-sm" data-toggle="tooltip" title="Edit" href="/edit_youtuber/${index._id}">
                            <i class="fas fa-pencil"></i>
                        </a>
                        <a class="btn w-35px h-35px mr-1 btn-danger text-uppercase btn-sm" data-toggle="tooltip" title="Delete" onclick="delete_sweet_alert('/delete_youtuber/${index._id}', 'Are you sure?')">
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
            // next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/view_youtuber");
        }
    }
    async edit_youtuber(req,res,next){
        try{
            res.locals.message = req.flash();
            const editData=await  youtuberServices.edit_youtuber(req);
            if(editData.status == true){
                res.render("youtuber/editYoutuber",{sessiondata:req.session.data,data:editData.youtuberData})
            }else if(editData.status == false){
                req.flash('error',editData.message);
                res.redirect("/view_youtuber");
            }

        }catch(error){
            // next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/view_youtuber");
        }
    }
    async edit_youtuber_data(req,res,next){
        try{
            const editPost=await youtuberServices.edit_youtuber_data(req);
            if(editPost.status == true){
                req.flash('success',editPost.message)
                res.redirect(`/edit_youtuber/${req.params.youtuberId}`);
            }else if(editPost.status == false){
                req.flash('error',editPost.message)
                res.redirect(`/edit_youtuber/${req.params.youtuberId}`);
            }

        }catch(error){
            // next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/view_youtuber");
        }
    }
    async delete_youtuber(req,res,next){
        try{
            const checkYoutuber=await youtuberServices.delete_youtuber(req);
            if(checkYoutuber.status == true){
                req.flash('success',checkYoutuber.message);
                res.redirect('/view_youtuber')
            }else if(checkYoutuber.status == false){
                req.flash('error',checkYoutuber.message);
                res.redirect('/view_youtuber')
            }

        }catch(error){
            // next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/view_youtuber");
        }
    }




}
module.exports = new youtuberController();