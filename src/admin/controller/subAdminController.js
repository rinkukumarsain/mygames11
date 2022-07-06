const subAdminServices = require("../services/subAdminServices");
const adminModel = require("../../models/adminModel");

class subAdminController {
  constructor() {
    return {
      addSubAdminPage: this.addSubAdminPage.bind(this),
      addSubAdminData: this.addSubAdminData.bind(this),
      viewSubAdminPage: this.viewSubAdminPage.bind(this),
      viewSubAdminData: this.viewSubAdminData.bind(this),
      viewPermisionPage: this.viewPermisionPage.bind(this),
      updateSubAdminPage: this.updateSubAdminPage.bind(this),
      updateSubAdmin: this.updateSubAdmin.bind(this),
      deleteSubAdmin: this.deleteSubAdmin.bind(this)
    };
  }
  async addSubAdminPage(req, res, next) {
    try {
      res.render("subAdmin/addSubAdmin", {
        sessiondata: req.session.data,
      });
    } catch (error) {
      // next(error);
      req.flash('error','Something went wrong please try again');
      res.redirect("/view-all-players");
    }
  }

  async addSubAdminData(req, res, next) {
    try {
      const addData = await subAdminServices.addSubAdminData(req);
      if (addData.status == false) {
        res.redirect("/add-sub-admin");
      } else if (addData.status == true) {
        res.redirect("/view-sub-admin");
      }
    } catch (error) {
      // next(error);
      req.flash('error','Something went wrong please try again');
      res.redirect("/");
    }
  }

  async viewSubAdminPage(req, res, next) {
    try {
      const {name, email, mobile} = req.query
      res.render("subAdmin/viewSubAdmin", {
        sessiondata: req.session.data,
        name, 
        email, 
        mobile,
      });
    } catch (error) {
      req.flash('error','Something went wrong please try again');
      res.redirect("/");
    }
  }

  async viewSubAdminData(req, res, next) {
    try {

      let limit = req.query.length;
      let start = req.query.start;
      let sortObj = {},
        dir,
        join;
      let condition = {
        role: {
          $not: {
            $eq: '0'
          }
        }
      };
      
      if(req.query.name || req.query.email || req.query.mobile){
        condition.name ={ $regex: new RegExp("^" + req.query.name.toLowerCase(), "i") } 
        condition.email = { $regex: new RegExp("^" + req.query.email.toLowerCase(), "i") } 
        condition.mobile = { $regex: req.query.mobile}
      }

      adminModel.countDocuments(condition).exec((err, rows) => {
        let totalFiltered = rows;
        let data = [];
        let count = 1;
        adminModel
          .find(condition)
          .skip(Number(start) ? Number(start) : "")
          .limit(Number(limit) ? Number(limit) : "")
          .exec((err, rows1) => {
            rows1.forEach(async (doc) => {
              data.push({
                count: count,
                name: doc.name,
                email: doc.email,
                mobile: doc.mobile,
                password: "******",
                permissions: `<a href="/view-permissions/${doc._id}" data-toggle="tooltip" title="Permission" class="btn w-35px h-35px mr-1 btn-primary text-uppercase btn-sm"><i class="fas fa-user-shield"></i></a>`,
                action: `<a class="btn w-35px h-35px mr-1 btn-orange text-uppercase btn-sm" data-toggle="tooltip" title="Edit" href="/update-sub-admin/${doc._id}"><i class="fas fa-pencil"></i></a> 
                <a class="btn w-35px h-35px mr-1 btn-danger text-uppercase btn-sm" data-toggle="tooltip" title="Delete" onclick="delete_sweet_alert('/delete-sub-admin/${doc._id}', 'Are you sure?')"><i class="far fa-trash-alt"></i></a>`,
              });
              count++;
              if (count > rows1.length) {
                let json_data = JSON.stringify({
                  recordsTotal: rows,
                  recordsFiltered: totalFiltered,
                  data: data,
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

  async viewPermisionPage(req, res, next) {
    try {
      const adminData = await adminModel.findById({
        _id: req.params.id
      })
      res.render("subAdmin/viewPermission", {
        sessiondata: req.session.data,
        settings_manager: adminData.permissions.settings_manager,
        series_manager: adminData.permissions.series_manager,
        teams_manager: adminData.permissions.teams_manager,
        player_manager: adminData.permissions.player_manager,
        upcoming_matches: adminData.permissions.upcoming_matches,
        all_matches: adminData.permissions.all_matches,
        update_playing_xi: adminData.permissions.update_playing_xi,
        user_manager: adminData.permissions.user_manager,
        verify_manager: adminData.permissions.verify_manager,
        received_fund: adminData.permissions.received_fund,
        notifications: adminData.permissions.notifications,
        contest_full_detail: adminData.permissions.contest_full_detail,
        contest_catagory_manager: adminData.permissions.contest_catagory_manager,
        global_contest: adminData.permissions.global_contest,
        custom_contest: adminData.permissions.custom_contest,
        import_leauge_in_contest: adminData.permissions.import_leauge_in_contest,
        results: adminData.permissions.results,
        banner: adminData.permissions.banner,
        general_tab_manager: adminData.permissions.general_tab_manager,
        add_point_manager: adminData.permissions.add_point_manager,
        offers_manager: adminData.permissions.offers_manager,
        youtuber_manager: adminData.permissions.youtuber_manager,
        point_system_manager: adminData.permissions.point_system_manager,
      });
    } catch (error) {
      // next(error);
      req.flash('error','Something went wrong please try again');
      res.redirect("/view-sub-admin");
    }
  }

  async updateSubAdminPage(req, res, next) {
    try {
      const adminData = await adminModel.findById({
        _id: req.params.id
      })
      res.render("subAdmin/updateSubAdmin", {
        sessiondata: req.session.data,
        id: adminData._id,
        name: adminData.name,
        email: adminData.email,
        mobile: adminData.mobile,
        settings_manager: adminData.permissions.settings_manager,
        series_manager: adminData.permissions.series_manager,
        teams_manager: adminData.permissions.teams_manager,
        player_manager: adminData.permissions.player_manager,
        upcoming_matches: adminData.permissions.upcoming_matches,
        all_matches: adminData.permissions.all_matches,
        update_playing_xi: adminData.permissions.update_playing_xi,
        user_manager: adminData.permissions.user_manager,
        verify_manager: adminData.permissions.verify_manager,
        received_fund: adminData.permissions.received_fund,
        notifications: adminData.permissions.notifications,
        contest_full_detail: adminData.permissions.contest_full_detail,
        contest_catagory_manager: adminData.permissions.contest_catagory_manager,
        global_contest: adminData.permissions.global_contest,
        custom_contest: adminData.permissions.custom_contest,
        import_leauge_in_contest: adminData.permissions.import_leauge_in_contest,
        results: adminData.permissions.results,
        banner: adminData.permissions.banner,
        general_tab_manager: adminData.permissions.general_tab_manager,
        add_point_manager: adminData.permissions.add_point_manager,
        offers_manager: adminData.permissions.offers_manager,
        youtuber_manager: adminData.permissions.youtuber_manager,
        point_system_manager: adminData.permissions.point_system_manager,
      });
    } catch (error) {
      // next(error)
      req.flash('error','Something went wrong please try again');
      res.redirect("/view-sub-admin");
    }
  }

  async updateSubAdmin(req, res, next) {
    try {
      const subAdminData = await adminModel.findById({
        _id: req.params.id
      })
      const updateData = await subAdminServices.updateSubAdminData(req);
      if (updateData.status == false) {
        res.redirect(`/update-sub-admin/${subAdminData._id}`);
      } else if (updateData.status == true) {
        res.redirect("/view-sub-admin");
      }
    } catch (error) {
      // next(error)
      req.flash('error','Something went wrong please try again');
      res.redirect("/view-sub-admin");
    }
  }

  async deleteSubAdmin(req, res, next) {
    try {
      await adminModel.findByIdAndRemove(req.params.id);
      res.redirect("/view-sub-admin");
    } catch (error) {
      // next(error)
      req.flash('error','Something went wrong please try again');
      res.redirect("/view-sub-admin");
    }
  }
}

module.exports = new subAdminController();