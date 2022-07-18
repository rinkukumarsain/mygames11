const leaderboardServices=require("../services/leaderboardServices");
const moment = require("moment");
const seriesModel=require("../../models/addSeriesModel");
const mongoose = require("mongoose");
class leaderboardController {
    constructor() {
        return {
            viewLeaderBoarderPage: this.viewLeaderBoarderPage.bind(this),
            viewLeaderBoardDatatable:this.viewLeaderBoardDatatable.bind(this),
            addSeriesPriceCardPage:this.addSeriesPriceCardPage.bind(this),
            addSeriesPriceCardData:this.addSeriesPriceCardData.bind(this),
            deleteSeriesPriceCard:this.deleteSeriesPriceCard.bind(this),
            distributeWinningAmountSeriesLeaderboard:this.distributeWinningAmountSeriesLeaderboard.bind(this),
        }
    }
  async viewLeaderBoarderPage(req,res,next){
    try{
        res.locals.message = req.flash();
        const data=await leaderboardServices.viewLeaderBoarderPage(req);
        let obj={};
        if(req.query.seriesStatus || req.query.seriesStatus){
        if(req.query.seriesStatus){
            obj.seriesStatus=req.query.seriesStatus
        }
        if(req.query.seriesStatus){
            obj.seriesStatus=req.query.seriesStatus
        }
        }else{
            obj.seriesStatus='live_end'
        }
        let sObj={};
        if(req.query.series_name){
            sObj.series_name=req.query.series_name
        }
        console.log("data.............",data,"obj................",obj,"sObj................",sObj)
        res.render("leaderboard/viewLeaderboardSeries",{sessiondata: req.session.data,data,obj,sObj});

    }catch(error){
        console.log(error);
        req.flash("error",'something wrong please try again later');
        res.redirect('/');
    }
  }
  async viewLeaderBoardDatatable(req,res,next){
    try{
        const seriesData=await seriesModel.findOne({name:req.query.series_name});
        let limit1 = req.query.length;
        let start = req.query.start;
        let conditions = {};
       
        if(req.query.series_name){
            conditions._id=mongoose.Types.ObjectId(req.query.series_name)
            if (req.query.seriesStatus) {
                if(req.query.seriesStatus == 'live_end'){
                    conditions.start_date= { $lt: moment().format('YYYY-MM-DD HH:mm:ss') }
                }
                if(req.query.seriesStatus == 'live'){
                    conditions.start_date= { $gt: moment().format('YYYY-MM-DD HH:mm:ss') }
                    conditions.end_date= { $lt: moment().format('YYYY-MM-DD HH:mm:ss') }
                }
                if(req.query.seriesStatus == 'end'){
                    conditions.end_date= { $gt: moment().format('YYYY-MM-DD HH:mm:ss') }
                }
            }
        }
        console.log("conditions............",conditions)
        seriesModel.countDocuments(conditions).exec((err, rows) => {
            let totalFiltered = rows;
            let data = [];
            let count = 1;
            seriesModel.find(conditions).skip(Number(start) ? Number(start) : '').limit(Number(limit1) ? Number(limit1) : '').exec((err, rows1) => {
                if (err) console.log(err);
                console.log("rows1...........",rows1)
                rows1.forEach((index) => {
                   
                    data.push({
                        "count": count,
                        "series_name": index.name,
                        "action": `<a href="/add_series_pricecard_page/${index._id}" class="btn btn-sm btn-info text-uppercase" data-toggle="tooltip" title="Add / Edit Price panel"><i class="fas fa-plus"></i>&nbsp; Add / Edit Price panel</a>
                        <a href="/leaderboard_rank/${index._id}"  class="btn btn-sm btn-danger  text-uppercase" data-toggle="tooltip" title="Check Rank"><i class="fas fa-eye"></i>&nbsp; Check Rank</a>
                        <a href="#" class="btn btn-sm text-uppercase btn-success text-white" data-toggle="modal" data-target="#key304"><span data-toggle="tooltip" title="Declare Winner Now"><i class="fad fa-trophy"></i>&nbsp; Declare Winner</span></a>
                        <div class="modal fade" id="key304" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                <div class="modal-dialog">
                                <div class="modal-content">
                                    <div class="modal-header">
                                    <h5 class="modal-title" id="exampleModalLabel">Winner Declare</h5>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">×</span>
                                    </button>
                                    </div>
                                    <div class="modal-body">
                                        <form action="/distribute_winning_amount_series_leaderboard/${index._id}" method="post">
                                            <div class="col-md-12 col-sm-12 form-group">
                                                <label> Enter Your Master Password </label>
                                                <input type="password" name="masterpassword" class="form-control" placeholder="Enter password here" required="">
                                            </div>
                                            <div class="col-md-12 col-sm-12 form-group">
                                                <input type="submit" class="btn btn-info btn-sm text-uppercase" value="Submit">
                                            </div>
                                            </form>
                                    </div>
                                    <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary btn-sm text-uppercase" data-dismiss="modal">Close</button>
                                    </div>
                                </div>
                                </div>
                            </div>`
                    });
                    count++;

                    if (count > rows1.length) {
                        // console.log(`data------SERVICES---------`, data);
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

    }catch(error){
        console.log(error);
    }
  }
  async addSeriesPriceCardPage(req,res,next){
    try{
        res.locals.message = req.flash();
        const getdata = await leaderboardServices.addSeriesPriceCardPage(req);
        if (getdata.status == true) {
          res.render("leaderboard/seriesPricecard", {
            sessiondata: req.session.data,
            data: getdata.series_Data,
            positionss: getdata.position,
            priceCardData: getdata.check_PriceCard,
            tAmount: getdata.totalAmountForPercentage,
          });
        } else if (getdata.status == false) {
          req.flash("error", getdata.message);
          res.redirect("/view_leaderBoard_page");
        }


    }catch(error){
        console.log(error)
    }
  }
  async addSeriesPriceCardData(req,res,next){
    try{
      const postPriceData = await leaderboardServices.addSeriesPriceCardData(req);
      
      if (postPriceData.status == true) {
        req.flash("success", postPriceData.message);
        res.redirect(`/add_series_pricecard_page/${req.body.seriesId}`);
      } else if (postPriceData.status == false) {
        req.flash("error", postPriceData.message);
        res.redirect(`/add_series_pricecard_page/${req.body.seriesId}`);
      } else {
        req.flash("error", " Page not Found ");
        res.redirect("/");
      }
    }catch(error){
        console.log(error)
    }
  }
  async deleteSeriesPriceCard(req,res,next){
    try {
        res.locals.message = req.flash();
        const deletePriceCard = await leaderboardServices.deleteSeriesPriceCard(
          req
        );
        if (deletePriceCard.status == true) {
          req.flash("success", deletePriceCard.message);
          res.redirect(`/add_series_pricecard_page/${req.query.seriesId}`);
        } else {
          req.flash("error", deletePriceCard.message);
          res.redirect(`/add_series_pricecard_page/${req.query.seriesId}`);
        }
      } catch (error) {
        req.flash("error", "Something went wrong please try again");
        res.redirect("/view_leaderBoard_page");
      }
  }
  async distributeWinningAmountSeriesLeaderboard(req,res,next){
    try{
        const data=await leaderboardServices.distributeWinningAmountSeriesLeaderboard(req);
        if(data.status){
            res.redirect("/");
        }else{
            req.flash("error",data.message);
            res.redirect("/view_leaderBoard_page");
        }


    }catch(error){
        console.log(error)
    }
  }
}
module.exports = new leaderboardController();