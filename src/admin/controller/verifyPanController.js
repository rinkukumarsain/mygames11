const moment = require("moment");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const verificationServices = require("../services/verificationServices");
const userModel = require("../../models/userModel");
const constant = require("../../config/const_credential");
const withdrawModel = require("../../models/withdrawModel");
const excel = require("exceljs");

class verifyManagerController {
  constructor() {
    return {
      verifyPan: this.verifyPan.bind(this),
      verifyBank_Datatable: this.verifyBank_Datatable.bind(this),
      verifyBank: this.verifyBank.bind(this),
      withdrawalAmount: this.withdrawalAmount.bind(this),
      viewBank_Details: this.viewBank_Details.bind(this),
      editBank_Details: this.editBank_Details.bind(this),
      update_Bank_Details: this.update_Bank_Details.bind(this),
      Update_Credentials_Bank: this.Update_Credentials_Bank.bind(this),
      verifyPan_Datatable: this.verifyPan_Datatable.bind(this),
      viewPan_Details: this.viewPan_Details.bind(this),
      update_Pan_Details: this.update_Pan_Details.bind(this),
      editPan_Details: this.editPan_Details.bind(this),
      Update_Credentials_Pan: this.Update_Credentials_Pan.bind(this),
      withdraw_amount_datatable2: this.withdraw_amount_datatable2.bind(this),
      approve_withdraw_request: this.approve_withdraw_request.bind(this),
      reject_withdraw_request: this.reject_withdraw_request.bind(this),

      // downloads
      downloadPanVerify: this.downloadPanVerify.bind(this),
      downloadallbankVerify: this.downloadallbankVerify.bind(this),
      downloadallwithdrawalrequest:
        this.downloadallwithdrawalrequest.bind(this),
    };
  }

  async verifyPan(req, res, next) {
    try {
      res.locals.message = req.flash();
      const { name, status, email, mobile } = req.query;
      res.render("verify/verifypan", {
        pending: req.query,
        sessiondata: req.session.data,
        selectQuery: status,
        Name: name,
        emailValue: email,
        mobileNo: mobile,
      });
    } catch (error) {
      req.flash("error", "Something went wrong please try again");
      res.redirect("/");
    }
  }

  async verifyPan_Datatable(req, res, next) {
    try {
      let limit1 = req.query.length;
      let start = req.query.start;
      let sortObject = {},
        dir,
        join,
        conditions = {};
      let name;
      conditions["pancard.status"] = 0;
      if (req.query.email) {
        conditions.email = {
          $regex: new RegExp(req.query.email.toLowerCase(), "i"),
        };
      }
      if (req.query.mobile) {
        conditions.mobile = Number(req.query.mobile);
      }
      if (req.query.name) {
        const data = req.query.name.toUpperCase();
        conditions["pancard.pan_name"] = { $regex: data };
      }
      if (req.query.status) {
        conditions["pancard.status"] = req.query.status;
      }

      userModel.countDocuments(conditions).exec((err, rows) => {
        let totalFiltered = rows;
        let data = [];
        let count = 1;
        userModel
          .find(conditions)
          .skip(Number(start) ? Number(start) : "")
          .limit(Number(limit1) ? Number(limit1) : "")
          .sort(sortObject)
          .exec((err, rows1) => {
            if (err) console.log(err);
            rows1.forEach((index) => {
              let PanVerfication = index.pancard.status;
              let appendField;
              if (PanVerfication == 0) {
                appendField = `<span class="text-warning">Pending</span>`;
              } else if (PanVerfication == 1) {
                appendField = `<span class="text-success">Verified</span>`;
              } else {
                appendField = `<span class="text-danger">cancelled</span>`;
              }
              data.push({
                S_NO: count,
                UID: `<a href="/getUserDetails/${index._id}">${index._id}</a>`,
                Name: index.pancard.pan_name || "",
                Email: index.email,
                Mobile_No: index.mobile || "",
                DOB: index.pancard.pan_dob || "",
                PAN_Number: index.pancard.pan_number || "",
                Image: `<a href="/${index.pancard.image}" target="_blank"><img src="${index.pancard.image}" class="w-40px view_team_table_images h-40px rounded-pill"></img></a>`,
                status: appendField,
                Comment: index.pancard.comment || "",
                Uploading_Date: `<span class="text-danger">${moment(
                  index.pancard.created_at
                ).format("YYYY-MM-DD HH:mm")}</span>`,
                Action: `<a href= "/viewpandetails/${index._id}"><i class="fas fa-2x fa-eye custom"></i></a>`,
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
      throw error;
    }
  }

  async viewPan_Details(req, res, next) {
    try {
      res.locals.message = req.flash();
      const viewUser = await verificationServices.viewPan_Details(req);
      if (viewUser.status == true) {
        res.render("verify/viewPanDetails", {
          sessiondata: req.session.data,
          viewUser: viewUser.data,
          baseUrl: constant.BASE_URL,
        });
      }
    } catch (error) {
      req.flash("error", "something went wrong");
      res.redirect("/verifypan");
    }
  }

  async update_Pan_Details(req, res, next) {
    try {
      const updatePan = await verificationServices.update_Pan_Details(req);
      let customMessage = (type, text) => req.flash(type, text);
      if (updatePan.status == true) {
        if (updatePan.data.pancard.status == 2) {
          customMessage(
            "success",
            `Successfully Reject request of ${updatePan.data.pancard.pan_name}`
          );
        }
        if (updatePan.data.pancard.status == 1) {
          customMessage(
            "success",
            `Successfully Activated request of ${updatePan.data.pancard.pan_name}`
          );
        }
        res.redirect(`/viewpandetails/${updatePan.data._id}`);
      } else {
        req.flash("warning", "please try again");
        res.redirect("/verifypan");
      }
    } catch (error) {
      // throw error;
      req.flash("error", "Something went wrong please try again");
      res.redirect("/verifypan");
    }
  }

  async editPan_Details(req, res, next) {
    try {
      res.locals.message = req.flash();
      const editUser = await verificationServices.editPan_Details(req);
      if (editUser.status == true) {
        res.render("verify/editPanDetails", {
          sessiondata: req.session.data,
          editUser: editUser.data,
        });
      }
    } catch (error) {
      // throw error;
      req.flash("error", "Something went wrong please try again");
      res.redirect("/verifypan");
    }
  }

  async Update_Credentials_Pan(req, res, next) {
    try {
      const updatePan = await userModel.findOneAndUpdate(
        { _id: req.body.userid },
        {
          $set: {
            "pancard.pan_dob": req.body.DOB || "",
            "pancard.pan_name": req.body.pan_name.toUpperCase(),
            "pancard.status": req.body.status,
            "user_verify.pan_verify": req.body.status,
            "pancard.comment": req.body.comment || "",
          },
        },
        { new: true }
      );
      let customMessage = (type, text) => req.flash(type, text);
      if (updatePan.pancard.status === 2) {
        customMessage(
          "success",
          `Successfully Reject request of ${updatePan.bank.accountholder}`
        );
      }
      if (updatePan.pancard.status == 1) {
        customMessage(
          "success",
          `Successfully Activated request of ${updatePan.bank.accountholder}`
        );
      }
      res.redirect(`/viewpandetails/${updatePan._id}`);
    } catch (error) {
      // throw error;
      req.flash("error", "Something went wrong please try again");
      res.redirect("/verifypan");
    }
  }

  async verifyBank(req, res, next) {
    try {
      res.locals.message = req.flash();
      const { mobile, email, name, status } = req.query;
      res.render("verify/verifybank", {
        pending: req.query,
        sessiondata: req.session.data,
        selectQuery: status,
        Name: name,
        emailValue: email,
        mobileNo: mobile,
      });
    } catch (error) {
      // next(error);
      req.flash("error", "Something went wrong please try again");
      res.redirect("/");
    }
  }

  async verifyBank_Datatable(req, res, next) {
    try {
      let limit1 = req.query.length;
      let start = req.query.start;
      let sortObject = {},
        dir,
        join,
        conditions = {};
      let name;
      conditions["bank.status"] = 0;
      if (req.query.email) {
        conditions.email = {
          $regex: new RegExp(req.query.email.toLowerCase(), "i"),
        };
      }
      if (req.query.mobile) {
        conditions.mobile = Number(req.query.mobile);
      }
      if (req.query.name) {
        const data = req.query.name.toUpperCase();
        conditions["bank.accountholder"] = { $regex: data };
      }
      if (req.query.status) {
        conditions["bank.status"] = req.query.status;
      }

      userModel.countDocuments(conditions).exec((err, rows) => {
        let totalFiltered = rows;
        let data = [];
        let count = 1;
        userModel
          .find(conditions)
          .skip(Number(start) ? Number(start) : "")
          .limit(Number(limit1) ? Number(limit1) : "")
          .sort(sortObject)
          .exec((err, rows1) => {
            if (err) console.log(err);
            rows1.forEach((index) => {
              let panVerfication = index.bank.status;
              let appendField;
              if (panVerfication == 0) {
                appendField = `<span class="text-warning">Pending</span>`;
              } else if (panVerfication == 1) {
                appendField = `<span class="text-success">Verified</span>`;
              } else {
                appendField = `<span class="text-danger">canceled</span>`;
              }
              data.push({
                S_NO: count,
                UID: `<a href="/getUserDetails/${index._id}">${index._id}</a>`,
                Name: index.bank.accountholder || "",
                Email: index.email || "",
                Mobile_No: index.mobile || "",
                Account_No: index.bank.accno || "",
                IFSC_Code: index.bank.ifsc || "",
                Bank_Name: index.bank.bankname || "",
                Branch: index.bank.bankbranch || "",
                State: index.bank.state || "",
                Image: `<a href="/${index.bank.image}" target="_blank"><img src="${index.bank.image}" class="w-40px view_team_table_images h-40px rounded-pill"></img></a>`,
                Status: appendField,
                Uploading_Date: `<span class="text-danger">${moment(
                  index.bank.created_at
                ).format("YYYY-MM-DD HH:mm")}</span>`,
                action: `<a href= "/viewbankdetails/${index._id}"><i class="fas fa-2x fa-eye custom"></i></a>`,
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

  async viewBank_Details(req, res, next) {
    try {
      res.locals.message = req.flash();
      const findUser = await verificationServices.viewBank_Details(req);
      console.log('constant.BASE_URL-------', constant.BASE_URL);
      if (findUser.status == true) {
        res.render("verify/viewBankDetails", {
          sessiondata: req.session.data,
          viewUser: findUser.data,
          baseUrl: constant.BASE_URL,
        });
      }
    } catch (error) {
      // next(error);
      req.flash("error", "Something went wrong please try again");
      res.redirect("/verifybankaccount");
    }
  }

  async editBank_Details(req, res, next) {
    try {
      res.locals.message = req.flash();
      const editUser = await verificationServices.editBank_Details(req);
      if (editUser.status == true) {
        res.render("verify/editBankDetails", {
          sessiondata: req.session.data,
          editUser: editUser.data,
        });
      }
    } catch (error) {
      // next(error);
      req.flash("error", "Something went wrong please try again");
      res.redirect("/verifybankaccount");
    }
  }

  async update_Bank_Details(req, res, next) {
    try {
      const updateBank = await verificationServices.update_Bank_Details(req);
      let customMessage = (type, text) => req.flash(type, text);
      if (updateBank.status == true) {
        if (updateBank.data.bank.status === 2) {
          customMessage(
            "success",
            `Successfully Reject request of ${updateBank.data.bank.accountholder}`
          );
        }
        if (updateBank.data.bank.status == 1) {
          customMessage(
            "success",
            `Successfully Activated request of ${updateBank.data.bank.accountholder}`
          );
        }
        res.redirect(`/viewbankdetails/${updateBank.data._id}`);
      } else {
        req.flash("warning", "try again later !!!");
        res.redirect(`/viewbankdetails/${updateBank.data._id}`);
      }
    } catch (error) {
      // next(error);
      req.flash("error", "Something went wrong please try again");
      res.redirect("/verifybankaccount");
    }
  }

  async withdrawalAmount(req, res, next) {
    try {
      res.locals.message = req.flash();
      const { status, apd_date, req_date, email, mobile } = req.query;
      res.render("verify/withdrawalAmount", {
        pending: req.query,
        sessiondata: req.session.data,
        selectQuery: status,
        emailValue: email,
        mobileNo: mobile,
        req_date: req_date,
        apd_date: apd_date,
      });
    } catch (error) {
      // next(error);
      req.flash("error", "Something went wrong please try again");
      res.redirect("/");
    }
  }

  async Update_Credentials_Bank(req, res, next) {
    try {
      const updateDetailsBank = await userModel.findOneAndUpdate(
        { _id: req.body.userid },
        {
          $set: {
            "bank.accno": req.body.accno || "",
            "bank.ifsc": req.body.ifsc.toUpperCase() || "",
            "bank.bankname": req.body.bankname || "",
            "bank.bankbranch": req.body.bankbranch || "",
            "bank.state": req.body.state || "",
            "bank.status": req.body.status || 0,
            "user_verify.bank_verify": req.body.status || 0,
            "bank.comment": req.body.comment || "",
          },
        },
        { new: true }
      );
      let customMessage = (type, text) => req.flash(type, text);
      if (updateDetailsBank.bank.status === 2) {
        customMessage("success", `bank request Successfully Reject`);
      }
      if (updateDetailsBank.bank.status === 1) {
        customMessage("success", `bank request Successfully Activated`);
      }

      res.redirect(`/editbankdetails/${updateDetailsBank._id}`);
    } catch (error) {
      req.flash("error", "Something went wrong please try again");
      res.redirect("/verifybankaccount");
    }
  }

  async withdraw_amount_datatable2(req, res, next) {
    try {
      let pipeline = [];
      pipeline.push({
        $lookup: {
          from: "users",
          localField: "userid",
          foreignField: "_id",
          as: "userdata",
        },
      });
      pipeline.push({
        $unwind: {
          path: "$userdata",
        },
      });
      pipeline.push({
        $project: {
          _id: 1,
          amount: 1,
          comment: 1,
          tranfer_id: 1,
          userid: 1,
          approved_date: 1,
          status: 1,
          withdraw_req_id: 1,
          paytm_number: 1,
          bank: "$userdata.bank.accno",
          username: "$userdata.username",
          email: "$userdata.email",
          mobile: "$userdata.mobile",
          Requested_Date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$userdata.bank.created_at",
            },
          },
          IFSC_Code: "$userdata.bank.ifsc",
          bankname: "$userdata.bank.bankname",
          bankbranch: "$userdata.bank.bankbranch",
        },
      });
      if (req.query.email) {
        pipeline.push({
          $match: {
            email: { $regex: new RegExp(req.query.email.toLowerCase(), "i") },
          },
        });
      }
      if (req.query.mobile) {
        pipeline.push({
          $match: { mobile: Number(req.query.mobile) },
        });
      }
      if (req.query.apd_date) {
        let datestring = moment(req.query.apd_date).format("YYYY-MM-DD");
        pipeline.push({
          $match: { approved_date: datestring },
        });
      }
      if (req.query.req_date) {
        let datestring = moment(req.query.req_date).format("YYYY-MM-DD");
        pipeline.push({
          $match: { Requested_Date: datestring },
        });
      }
      if (req.query.status) {
        pipeline.push({
          $match: { status: Number(req.query.status) },
        });
      }
      // if(req.query.start) {
      //     pipeline.push({
      //         $skip: Number(req.query.start)
      //     });
      // }
      withdrawModel.countDocuments(pipeline).exec((err, rows) => {
        let totalFiltered = rows;
        let data = [];
        let count = 1;
        // pipeline.push({
        //     $limit:Number(req.query.limit) && Number(req.query.limit) > 0 ? Number(req.query.limit):rows
        // });
        withdrawModel.aggregate(pipeline).exec((err, rows1) => {
          rows1.forEach((index) => {
            let newappenField;
            let appendDate;
            let appendAmount;
            if (index.status == 1) {
              newappenField = `<span class="text-success"><i class="far fa-check-circle"></i>approved</span>`;
              appendAmount = `<span class="text-success" Style="font-size:120% !important">${
                index.amount || 0
              }</span>`;
            } else if (index.status == 2) {
              newappenField = `<span class="text-danger"><i class="far fa-times-circle"></i>rejected</span>`;
              appendAmount = `<span class="text-danger" Style="font-size:130% !important">${
                index.amount || 0
              }</span>`;
            } else {
              newappenField = `<a style="cursor: pointer;" data-toggle="tooltip dropdown-item" title="approve" onclick="confirmation('/approve-withdraw-request/${index.userid}?withdrawalId=${index._id}&amount=${index.amount}', 'Are you sure?')"><span class="text-success"><i class="far fa-check-circle"></i>Approve</span></a>&nbsp&nbsp&nbsp
                                
                                <a data-toggle="modal" data-target="#deductmoneymodal" class="editbtn" style="cursor:pointer;" style="cursor: pointer; text-decoration:none;"><span class="text-danger"><i class="far fa-times-circle"></i>Reject</span></a>`;
              appendAmount = `<span class="text-warning"; font-size:150% !important">${
                index.amount || 0
              }</span>
                            <div id="deductmoneymodal" class="modal fade abc  px-0" role="dialog" style="z-index: 0.2%;">
                            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable  h-100">
                            <form action="/reject-withdraw-request/${
                              index.userid
                            }?withdrawalId=${index._id}&amount=${
                index.amount
              }" method="GET">
                            <!-- Modal content-->
                            <div class="modal-content">
                              <div class="modal-header">
                              <h4 class="modal-title _head_ing">Cancel Request</h4>
                              <button type="button" class="close" data-dismiss="modal">&times;</button>
                              </div>
                              <div class="modal-body">
                              
                                <input type="hidden" value="${
                                  index.userid
                                }" name="userid" id="userid">
                                <input type="hidden" value="${
                                  index.amount
                                }" name="amount" id="amount">
                                <input type="hidden" value="${
                                  index._id
                                }" name="withdrawalId" id="withdrawalId">
                                <div class="col-md-12 col-sm-12 form-group ">
                                  <label> Comment </label>
                                  <input type="text" class="form-control" id="description" name="description" autocomplete="off" required></input>
                                </div>
                                </div>
                                <div class="modal-footer">
                                <div class="col-auto text-right ml-auto mt-4 mb-2">
                                   <input type="submit" class="btn btn-sm btn-success text-uppercase" value="Submit">
                                   <button type="button" class="btn btn-sm btn-secondary" data-dismiss="modal">Close</button>
                                   </div>
                                   </div>
                                  
                              </div>
                              </form>
                            </div>
                          </div>`
                        }
                        if (index.approved_date) {
                            appendDate = `<span class="text-success">${moment(index.approved_date).format("YYYY-MM-DD")}</span>`;
                        } else {
                            appendDate = `<span class="text-danger">Not Approved Yet</span>`;
                        }
                        data.push({
                            S_NO: count,
                            UID: `<a href="/getUserDetails/${index.userid}">${index.userid}</a>`,
                            Account_Number: index.bank || '',
                            W_ammount: appendAmount,
                            user_Name: index.username,
                            // w_Req_Id: index.withdraw_req_id || '',
                            transfer_Id: index.tranfer_id || '',
                            IFSC_Code: index.IFSC_Code || '',
                            Bank_Name: index.bankname || '',
                            Bank_Branch: index.bankbranch || '',
                            Requested_Date: `<span class="text-warning">${moment(index.Requested_Date).format("YYYY-MM-DD HH:mm")}</span>`,
                            Email: index.email || '',
                            app_rej_Date: appendDate,
                            Mobile: index.mobile || '',
                            Admin_Comment: index.comment || '',
                            actions: newappenField,
                        });
                        count++;
                        if (count > rows1.length) {
                            let json_data = JSON.stringify({ data });
                            res.send(json_data);
                        }
                    });
                });
            });
    } catch (error) {
      // throw error;
      req.flash("error", "Something went wrong please try again");
      res.redirect("/withdraw_amount");
    }
  }

  async approve_withdraw_request(req, res, next) {
    try {
      const approvalReq = await verificationServices.approve_withdraw_request(
        req
      );
      if (approvalReq.status == true) {
        req.flash("success", "withdrawal request approved");
        res.redirect("/withdraw_amount");
      }
    } catch (error) {
      req.flash("error", "something went wrong");
      res.redirect("/withdraw_amount");
    }
  }

  async reject_withdraw_request(req, res, next) {
    try {
      const approvalReq = await verificationServices.reject_withdraw_request(
        req
      );
      if (approvalReq.status == true) {
        req.flash("success", "withdrawal request rejected");
        res.redirect("/withdraw_amount");
      }
    } catch (error) {
      req.flash("error", "something went wrong");
      res.redirect("/withdraw_amount");
    }
  }
  async downloadPanVerify(req, res, next) {
    try {
      let conditions = {};
      let name;
      conditions["pancard.status"] = 0;
      if (req.query.email) {
        conditions.email = {
          $regex: new RegExp(req.query.email.toLowerCase(), "i"),
        };
      }
      if (req.query.mobile) {
        conditions.mobile = Number(req.query.mobile);
      }
      if (req.query.name) {
        const data = req.query.name.toUpperCase();
        conditions["pancard.pan_name"] = { $regex: data };
      }
      if (req.query.status) {
        conditions["pancard.status"] = req.query.status;
      }

      let data = [];
      let count = 1;
      userModel.find(conditions).exec((err, rows1) => {
        if (err) console.log(err);
        rows1.forEach((index) => {
          let PanVerfication = index.pancard.status;
          let appendField;
          if (PanVerfication == 0) {
            appendField = `Pending`;
          } else if (PanVerfication == 1) {
            appendField = `Verified`;
          } else {
            appendField = `cancelled`;
          }
          data.push({
            S_NO: count,
            UID: index._id,
            Name: index.pancard.pan_name || "",
            Email: index.email,
            Mobile_No: index.mobile || "",
            DOB: index.pancard.pan_dob || "",
            PAN_Number: index.pancard.pan_number || "",
            status: appendField,
            Comment: index.pancard.comment || "",
            Uploading_Date: moment(index.pancard.created_at).format(
              "YYYY-MM-DD HH:mm"
            ),
          });
          count++;
        });

        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet("panVerify");
        worksheet.columns = [
          { header: "s.no", key: "S_NO", width: 5 },
          { header: "Name", key: "Name", width: 20 },
          { header: "Email", key: "Email", width: 30 },
          { header: "Mobile No.", key: "Mobile_No", width: 12 },
          { header: "DOB", key: "DOB", width: 15 },
          { header: "PAN Number", key: "PAN_Number", width: 15 },
          { header: "Status", key: "status", width: 12 },
          { header: "Comment", key: "Comment", width: 18 },
          { header: "Uploading Date", key: "Uploading_Date", width: 22 },
        ];
        // Add Array Rows
        worksheet.addRows(data);
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=" + "panVerify.xlsx"
        );
        return workbook.xlsx.write(res).then(function () {
          res.status(200).end();
        });
      });
    } catch (error) {
      console.log(error);
    }
  }
  async downloadallbankVerify(req, res, next) {
    try {
      let conditions = {};
      let name;
      conditions["bank.status"] = 0;
      if (req.query.email) {
        conditions.email = {
          $regex: new RegExp(req.query.email.toLowerCase(), "i"),
        };
      }
      if (req.query.mobile) {
        conditions.mobile = Number(req.query.mobile);
      }
      if (req.query.name) {
        const data = req.query.name.toUpperCase();
        conditions["bank.accountholder"] = { $regex: data };
      }
      if (req.query.status) {
        conditions["bank.status"] = req.query.status;
      }

      let data = [];
      let count = 1;
      userModel.find(conditions).exec((err, rows1) => {
        if (err) console.log(err);
        rows1.forEach((index) => {
          let panVerfication = index.bank.status;
          let appendField;
          if (panVerfication == 0) {
            appendField = "Pending";
          } else if (panVerfication == 1) {
            appendField = `Verified`;
          } else {
            appendField = `canceled`;
          }
          data.push({
            S_NO: count,
            Name: index.bank.accountholder || "",
            Email: index.email || "",
            Mobile_No: index.mobile || "",
            Account_No: index.bank.accno || "",
            IFSC_Code: index.bank.ifsc || "",
            Bank_Name: index.bank.bankname || "",
            Branch: index.bank.bankbranch || "",
            State: index.bank.state || "",
            Status: appendField,
            Uploading_Date: moment(index.bank.created_at).format(
              "YYYY-MM-DD HH:mm"
            ),
          });
          count++;
        });
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet("bankVerify");
        worksheet.columns = [
          { header: "s.no", key: "S_NO", width: 5 },
          { header: "Name", key: "Name", width: 20 },
          { header: "Email", key: "Email", width: 30 },
          { header: "Account No.", key: "Account_No", width: 12 },
          { header: "IFSC Code", key: "IFSC_Code", width: 15 },
          { header: "Bank Name", key: "Bank_Name", width: 15 },
          { header: "Branch", key: "Branch", width: 12 },
          { header: "State", key: "State", width: 18 },
          { header: "Status", key: "Status", width: 18 },
          { header: "Uploading Date", key: "Uploading_Date", width: 22 },
        ];
        // Add Array Rows
        worksheet.addRows(data);
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=" + "bankVerify.xlsx"
        );
        return workbook.xlsx.write(res).then(function () {
          res.status(200).end();
        });
      });
    } catch (error) {
      console.log(error);
    }
  }
  async downloadallwithdrawalrequest(req, res, next) {
    try {
      let pipeline = [];
      pipeline.push({
        $lookup: {
          from: "users",
          localField: "userid",
          foreignField: "_id",
          as: "userdata",
        },
      });
      pipeline.push({
        $unwind: {
          path: "$userdata",
        },
      });
      pipeline.push({
        $project: {
          _id: 1,
          amount: 1,
          comment: 1,
          tranfer_id: 1,
          userid: 1,
          approved_date: 1,
          status: 1,
          withdraw_req_id: 1,
          paytm_number: 1,
          bank: "$userdata.bank.accno",
          username: "$userdata.username",
          email: "$userdata.email",
          mobile: "$userdata.mobile",
          Requested_Date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$userdata.bank.created_at",
            },
          },
          IFSC_Code: "$userdata.bank.ifsc",
          bankname: "$userdata.bank.bankname",
          bankbranch: "$userdata.bank.bankbranch",
        },
      });
      if (req.query.email != "") {
        pipeline.push({
          $match: { email: { $regex: req.query.email } },
        });
      }
      if (req.query.mobile != "") {
        pipeline.push({
          $match: { mobile: Number(req.query.mobile) },
        });
      }
      if (req.query.apd_date != "") {
        let datestring = moment(req.query.apd_date).format("YYYY-MM-DD");
        pipeline.push({
          $match: { approved_date: datestring },
        });
      }
      if (req.query.req_date != "") {
        let datestring = moment(req.query.req_date).format("YYYY-MM-DD");
        pipeline.push({
          $match: { Requested_Date: datestring },
        });
      }
      if (req.query.status != "") {
        pipeline.push({
          $match: { status: Number(req.query.status) },
        });
      }
      pipeline.push({
        $skip: Number(req.query.start) ? Number(req.query.start) : 0,
      });

      let data = [];
      let count = 1;
      // pipeline.push({
      //     $limit:Number(req.query.limit) && Number(req.query.limit) > 0 ? Number(req.query.limit):rows
      // });
      withdrawModel.aggregate(pipeline).exec((err, rows1) => {
        if (err) console.log(err);
        rows1.forEach((index) => {
          let newappenField;
          let appendDate;
          let appendAmount;
          if (index.status == 1) {
            newappenField = `approved`;
            appendAmount = `${index.amount || 0}`;
          } else if (index.status == 2) {
            newappenField = `rejected`;
            appendAmount = `${index.amount || 0}`;
          } else {
            newappenField = ` `;
            appendAmount = ` `;
          }
          if (index.approved_date) {
            appendDate = moment(index.approved_date).format("YYYY-MM-DD");
          } else {
            appendDate = `Not Approved Yet`;
          }
          data.push({
            S_NO: count,
            Account_Number: index.bank || "",
            W_ammount: appendAmount,
            user_Name: index.username,
            w_Req_Id: index.withdraw_req_id || "",
            transfer_Id: index.tranfer_id || "",
            IFSC_Code: index.IFSC_Code || "",
            Bank_Name: index.bankname || "",
            Bank_Branch: index.bankbranch || "",
            Requested_Date: moment(index.Requested_Date).format(
              "YYYY-MM-DD HH:mm"
            ),
            Email: index.email || "",
            app_rej_Date: appendDate,
            Mobile: index.mobile || "",
            Admin_Comment: index.comment || "",
            actions: newappenField,
          });
          count++;
        });
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet("withdrawal");
        worksheet.columns = [
          { header: "s.no", key: "S_NO", width: 5 },
          { header: "Account Number", key: "Account_Number", width: 20 },
          { header: "W ammount", key: "W_ammount", width: 30 },
          { header: "User Name", key: "user_Name", width: 12 },
          { header: "W. Req Id", key: "w_Req_Id", width: 15 },
          { header: "transfer Id", key: "transfer_Id", width: 15 },
          { header: "IFSC Code", key: "IFSC_Code", width: 12 },
          { header: "Bank Name", key: "Bank_Name", width: 18 },
          { header: "Bank Branch", key: "Bank_Branch", width: 18 },
          { header: "Requested Date", key: "Requested_Date", width: 18 },
          { header: "Email", key: "Email", width: 18 },
          { header: "app_rej_Date", key: "app_rej_Date", width: 18 },
          { header: "Mobile", key: "Mobile", width: 18 },
          { header: "Admin_Comment", key: "Admin Comment", width: 18 },
          { header: "actions", key: "actions", width: 18 },
        ];
        // Add Array Rows
        worksheet.addRows(data);
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=" + "withdrawal.xlsx"
        );
        return workbook.xlsx.write(res).then(function () {
          res.status(200).end();
        });
      });
    } catch (error) {
      console.log(error);
    }
  }
}
module.exports = new verifyManagerController();
