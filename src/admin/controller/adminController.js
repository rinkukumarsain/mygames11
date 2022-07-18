const adminServices = require('../services/adminServices');
const adminModel = require('../../models/adminModel');
const mongoose = require("mongoose");
class adminPanelController {
    constructor() {
        return {
            registerAdminPage: this.registerAdminPage.bind(this),
            registerAdminData: this.registerAdminData.bind(this),
            loginAdminPage: this.loginAdminPage.bind(this),
            loginAdminData: this.loginAdminData.bind(this),
            logout: this.logout.bind(this),
            changePasswordPage: this.changePasswordPage.bind(this),
            changePassword: this.changePassword.bind(this),
            adminProfilePage:this.adminProfilePage.bind(this),
            updateProfileData:this.updateProfileData.bind(this),
            // ---------------------

            viewGeneralTab: this.viewGeneralTab.bind(this),
            generalTabData: this.generalTabData.bind(this),
            generalTabTable: this.generalTabTable.bind(this),
            generalTabDelete: this.generalTabDelete.bind(this),
            addBanner: this.addBanner.bind(this),
            addBannerData: this.addBannerData.bind(this),
            viewallBanner: this.viewallBanner.bind(this),
            viewAllSideBanner: this.viewAllSideBanner.bind(this),
            editSideBanner: this.editSideBanner.bind(this),
            editBannerData: this.editBannerData.bind(this),
            deleteSideBanner: this.deleteSideBanner.bind(this),
        }
    }

    async registerAdminPage(req, res, next) {
        try {
            res.locals.message = req.flash();
            res.render("admin/registerAdmin", {
                sessiondata: req.session.data
            });

        } catch (error) {
            next(error);
        }
    }
    async registerAdminData(req, res, next) {
        try {

            const registerData = await adminServices.registerAdminData(req);
            console.log("registerData........", registerData)
            if (registerData.status == false) {
                res.redirect("/register-admin")
            } else if (registerData.status == true) {
                res.redirect("/login-admin")
            }


        } catch (error) {
            //  next(error);
            req.flash('error', 'Something went wrong please try again');
            res.redirect('/register-admin');
        }
    }
    async loginAdminPage(req, res, next) {
        try {
            res.locals.message = req.flash();
            if(req.session.admin) {
                res.redirect("/");
            }
            res.render("admin/adminLogin", {
                registerData: undefined
            });

        } catch (error) {
            next(error);
        }
    }
    async loginAdminData(req, res, next) {
        try {
            res.locals.message = req.flash();
            const registerData = await adminServices.loginAdminData(req);
            if (registerData.status === false) {
                res.render("admin/adminLogin", {
                    registerData
                });
            } else {
                req.session.regenerate(function () {
                    req.session.admin = true;
                    req.session.data = registerData.data[0];

                    let cookie = req.headers.cookie;
                    if (cookie != '' && cookie != undefined) {
                        let url = '';
                        let cookies = cookie.split(';')
                        for (let i of cookies) {
                            if (i.includes('url=')) {
                                url = i;
                            }
                        }
                        let newUrl = url.replace(/url=/g, '').replace(/%3A/g, ':').replace(/%2F/g, '/').replace(/%3F/g, '?').replace(/%3D/g, '=').replace(/%26/g, '&').replace(/%23/g, '#').replace(/%40/g, '@');
                        if (newUrl) {
                            return res.redirect(newUrl);
                        }
                    }

                    res.redirect("/");
                });
            }

        } catch (error) {
            next(error);
        }
    }
    async adminProfilePage(req,res,next){
        try{
            const adminData = await adminModel.findOne({
                role: req.session.data.role
              });
              req.session.data = adminData
              res.locals.message = req.flash();
              res.render("admin/adminProfile", {
                sessiondata: req.session.data
              });
        }catch(error){
            console.log(error)
        }
    }
    async updateProfileData(req, res, next) {
        try {
          const updateData = await adminServices.updateProfileData(req);
          if (updateData.status == true) {
            req.flash("success", updateData.message);
            res.redirect("/");
          } else {
            req.flash("error", updateData.message);
            res.redirect("/admin-profile-page");
          }
        } catch (error) {
          console.log(error);
        }
      }
    // --------------------------------------------------


    async viewGeneralTab(req, res, next) {
        try {
            res.locals.message = req.flash();
            console.log(`req.session.data`, req.session.data);
            // let emailId=req.session.emailId;
            let adminId = '0';

            res.render('generalTabs/generalTab', {
                sessiondata: req.session.data,
                adminId
            });

        } catch (error) {
            // next(error);
            req.flash('error', 'Something went wrong please try again');
            res.redirect("/");
        }
    }
    async generalTabData(req, res, next) {
        try {
            // console.log("req.body...generalTb", req.body, req.params.id)
            const addGenralTab = await adminServices.addGenralTab(req);
            if (addGenralTab) {
                res.redirect('/view-general-tab');
            }

        } catch (error) {
            // next(error);
            req.flash('error', 'Something went wrong please try again');
            res.redirect('/view-general-tab');
        }
    }
    async generalTabTable(req, res, next) {
        try {
            // -------------

            // console.log('req------DATATABLE-------controller');
            let limit1 = req.query.length;
            let start = req.query.start;
            let sortObject = {},
                dir, join
            let conditions = {};
            adminModel.countDocuments(conditions).exec((err, rows) => {
                // console.log("rows....................",rows)
                let totalFiltered = rows;
                let data = [];
                let count = 1;
                adminModel.find(conditions).skip(Number(start) ? Number(start) : '').limit(Number(limit1) ? Number(limit1) : '').exec((err, rows1) => {
                    // console.log('--------rows1-------------', rows1);
                    if (err) console.log(err);
                    rows1.forEach(async (index) => {
                        let newcount = 1
                        index.general_tabs.forEach(async (doc) => {
                            console.log(doc);
                            data.push({
                                'newcount': `${newcount}`,
                                'Type': doc.type,
                                'amount': `<div class="text-center">${doc.amount}</div>`,
                                'Action': `<div class="text-center"><a onclick="delete_sweet_alert('/general_delete?generalTabId=${doc._id}&Id=${index._id}', 'Are you sure you want to delete this data?')" class="btn btn-sm btn-danger w-35px h-35px text-uppercase" data-toggle="tooltip" title="Delete"><i class ='far fa-trash-alt'></i></a></div>`
                            });
                            newcount++
                        })

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



            // -------------------


        } catch (error) {
            console.log(error)
        }
    }
    async generalTabDelete(req, res, next) {
        try {
            res.locals.message = req.flash();
            const deleteData = await adminServices.generalTabDelete(req);
            if (deleteData) {
                res.redirect('/view-general-tab')
            }

        } catch (error) {
            // console.log(error)
            req.flash('error', 'Something went wrong please try again');
            res.redirect('/view-general-tab');
        }
    }

    // ------------------------------banner-------------------------------------------------

    async addBanner(req, res, next) {
        try {
            res.locals.message = req.flash();
            // let emailId=req.session.emailId;
            let adminId = '0';
            res.render("banner/addSideBanner", {
                sessiondata: req.session.data,
                adminId
            });

        } catch (error) {
            //  next(error);
            req.flash('error', 'Something went wrong please try again');
            res.redirect("/");
        }
    }
    async addBannerData(req, res, next) {
        try {
            res.locals.message = req.flash();
            // console.log("banner body............",req.body,req.file);
            const addBanner = await adminServices.addBanner(req);
            // console.log("addBanner...controller",addBanner)
            if (addBanner) {
                res.redirect("/view-all-Banner")
            }

        } catch (error) {
            //  next(error);
            req.flash('error', 'Something went wrong please try again');
            res.redirect('/add-banner');
        }
    }
    async viewallBanner(req, res, next) {
        try {
            res.locals.message = req.flash();
            res.render("banner/viewSideBanner", {
                sessiondata: req.session.data,
            })

        } catch (error) {
            //  next(error);
            req.flash('error', 'Something went wrong please try again');
            res.redirect("/");
        }
    }
    async viewAllSideBanner(req, res, next) {
        try {
            // -------------
            let limit1 = req.query.length;
            let start = req.query.start;
            let sortObject = {},
                dir, join
            let conditions = {};

            adminModel.countDocuments(conditions).exec((err, rows) => {
                // console.log("rows....................",rows)
                let totalFiltered = rows;
                let data = [];
                let count = 1;
                adminModel.find(conditions).skip(Number(start) ? Number(start) : '').limit(Number(limit1) ? Number(limit1) : '').exec((err, rows1) => {
                    // console.log('--------rows1-------------', rows1);
                    if (err) console.log(err);
                    rows1.forEach(async (index) => {
                        let newcount = 1
                        index.sidebanner.forEach(async (doc) => {
                            // console.log("doc....iiiiiiiiiiiiiiiiiiiiii....nnnnnnn....",doc.image);
                            data.push({
                                'newcount': `${newcount}`,
                                'type': doc.type,
                                'bannerType':doc.bannerType,
                                'image': `${doc.image ? `<img src="${doc.image}" class="w-80px h-80px rounded-10 shadow border border-primary">` : ""}`,
                                'url': `<div class="container">${doc.url}</div>`,
                                'Action': `<a class="btn btn-sm text-uppercase mr-2 btn-primary w-35px h-35px" title="Edit" href="/edit-sideBanner?Id=${index._id}&bannerId=${doc._id}"> <i class="fas fa-pencil" aria-hidden="true"></i></a>
                                <a class="btn btn-sm text-uppercase mr-2 btn-danger w-35px h-35px" onclick="delete_sweet_alert('/delete-sideBanner?Id=${index._id}&bannerId=${doc._id}', 'Are you sure you want to delete this data?')" title="Delete"><i class="fal fa-trash-alt"></i></a>`
                            });
                            newcount++
                        })

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


            // --------------
        } catch (error) {
            next(error);
        }
    }
    async editSideBanner(req, res, next) {
        try {
            res.locals.message = req.flash();
            // let emailId=req.session.emailId;
            let adminId = '0';
            const editSideBannerData = await adminServices.editSideBanner(req);
            // console.log("editSideBanner........",editSideBannerData);
            if (editSideBannerData) {
                res.render("banner/editSideBanner", {
                    sessiondata: req.session.data,
                    data: editSideBannerData[0],
                    adminId
                });
            }

        } catch (error) {
            //  next(error);
            req.flash('error', 'Something went wrong please try again');
            res.redirect('/view-all-sideBanner');
        }
    }
    async editBannerData(req, res, next) {
        try {
            
            res.locals.message = req.flash();
            const editBanner = await adminServices.editBannerData(req);
            if (editBanner) {
                res.redirect('/view-all-Banner');
            }

        } catch (error) {
            //  next(error);
            req.flash('error', 'Something went wrong please try again');
            res.redirect('/view-all-sideBanner');
        }
    }
    async deleteSideBanner(req, res, next) {
        try {
            res.locals.message = req.flash();
            const deleteData = await adminServices.deleteSideBanner(req);
            if (deleteData) {
                res.redirect("/view-all-Banner");
            }
        } catch (error) {
            //  next(error);
            req.flash('error', 'Something went wrong please try again');
            res.redirect('/view-all-sideBanner');
        }
    }

    // ----------------------- logout ----------------------------
    async logout(req, res, next) {
        try {
            res.locals.message = req.flash();
            req.session.destroy();
            res.clearCookie('url');
            res.redirect("/")
        } catch (error) {
            next(error);
        }
    }

    // ------------------------- change password ------------------------
    async changePasswordPage(req, res, next) {
        try {
            res.locals.message = req.flash();
            res.render("admin/changePassword", {
                changePasswordData: undefined
            })
        } catch (error) {
            next(error);
        }
    }
    async changePassword(req, res, next) {
        try {
            res.locals.message = req.flash();
            const changePasswordData = await adminServices.changePasswordData(req);
            if (changePasswordData.status == false) {
                res.render("admin/changePassword", {
                    changePasswordData
                })
            } else if (changePasswordData.status == true) {
                res.redirect("/")
            }
        } catch (error) {
            next(error);
        }
    }


}
module.exports = new adminPanelController();