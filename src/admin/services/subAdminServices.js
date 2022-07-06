const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const adminModel = require('../../models/adminModel');

class subAdminServices {
  constructor() {
    return {
      addSubAdminData: this.addSubAdminData.bind(this),
      updateSubAdminData: this.updateSubAdminData.bind(this),
    };
  }
  async addSubAdminData(req) {
    try {
      // Check entered email and mobile
      const checkMailId = await adminModel.findOne({
        email: req.body.email
      });
      const checkMobile = await adminModel.findOne({
        mobile: req.body.mobile
      });
      if (checkMailId) {
        return {
          status: false,
          message: 'Email Id already Registered',
        };
      } else if (checkMobile) {
        return {
          status: false,
          message: 'Mobile Number already Registered',
        };
      } else {
        // Hash password
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        // Permissions
        let permissions = {
          settings_manager: req.body.settings_permissions,
          series_manager: req.body.series_permissions,
          teams_manager: req.body.teams_permissions,
          player_manager: req.body.player_permissions,
          upcoming_matches: req.body.upcoming_matches_permissions,
          all_matches: req.body.all_matches_permissions,
          update_playing_xi: req.body.update_playing_xi_permissions,
          user_manager: req.body.user_permissions,
          verify_manager: req.body.verify_permissions,
          received_fund: req.body.received_fund_permissions,
          notifications: req.body.notifications_permissions,
          contest_full_detail: req.body.contest_full_detail_permissions,
          contest_catagory_manager: req.body.contest_catagory_manager_permissions,
          global_contest: req.body.global_contest_permissions,
          custom_contest: req.body.custom_contest_permissions,
          import_leauge_in_contest: req.body.import_leauge_in_contest_permissions,
          results: req.body.results_permissions,
          banner: req.body.banner_permissions,
          general_tab_manager: req.body.general_tab_permissions,
          add_point_manager: req.body.add_point_permissions,
          offers_manager: req.body.offers_permissions,
          youtuber_manager: req.body.youtuber_permissions,
          point_system_manager: req.body.point_system_permissions,
        };

        // Register sub admin
        const insertSubAdmin = new adminModel({
          name: req.body.name,
          email: req.body.email,
          password: hash,
          mobile: req.body.mobile,
          role: '1',
          permissions: permissions,
        });
        let saveSubAdmin = await insertSubAdmin.save();
        if (saveSubAdmin) {
          return {
            message: 'register successfully',
            status: true,
          };
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async updateSubAdminData(req) {
    try {
      let permissions = {
        settings_manager: req.body.settings_permissions,
        series_manager: req.body.series_permissions,
        teams_manager: req.body.teams_permissions,
        player_manager: req.body.player_permissions,
        upcoming_matches: req.body.upcoming_matches_permissions,
        all_matches: req.body.all_matches_permissions,
        update_playing_xi: req.body.update_playing_xi_permissions,
        user_manager: req.body.user_permissions,
        verify_manager: req.body.verify_permissions,
        received_fund: req.body.received_fund_permissions,
        notifications: req.body.notifications_permissions,
        contest_full_detail: req.body.contest_full_detail_permissions,
        contest_catagory_manager: req.body.contest_catagory_manager_permissions,
        global_contest: req.body.global_contest_permissions,
        custom_contest: req.body.custom_contest_permissions,
        import_leauge_in_contest: req.body.import_leauge_in_contest_permissions,
        results: req.body.results_permissions,
        banner: req.body.banner_permissions,
        general_tab_manager: req.body.general_tab_permissions,
        add_point_manager: req.body.add_point_permissions,
        offers_manager: req.body.offers_permissions,
        youtuber_manager: req.body.youtuber_permissions,
        point_system_manager: req.body.point_system_permissions,
      };

      let filter = {
        _id: req.params.id
      };

      let updateSubAdmin = await adminModel.findOneAndUpdate(filter, {
        $set: {
          name: req.body.name,
          email: req.body.email,
          mobile: req.body.mobile,
          permissions: permissions
        }
      }, {
        upsert: true
      })
      if (updateSubAdmin) {
        return {
          message: 'update successfully',
          status: true,
        };
      }
    } catch (error) {
      throw error
    }
  }
}

module.exports = new subAdminServices();