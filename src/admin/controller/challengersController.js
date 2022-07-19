const challengersModel = require("../../models/challengersModel");
const challengersService = require("../services/challengersService");
const contestCategoryModel = require("../../models/contestcategoryModel");
const mongoose=require("mongoose");
const listMatchModel = require("../../models/listMatchesModel");
const teamModel = require("../../models/teamModel");
const playersModel = require("../../models/playerModel");
const listMatchesModel = require("../../models/listMatchesModel");

class challengersController {
    constructor() {
        return {
            viewGlobleContests_page: this.viewGlobleContests_page.bind(this),
            addGlobalContest_page: this.addGlobalContest_page.bind(this),
            addGlobalchallengersData: this.addGlobalchallengersData.bind(this),
            globalChallengersDatatable: this.globalChallengersDatatable.bind(this),
            addpricecard_page: this.addpricecard_page.bind(this),
            editglobalcontest_page:this.editglobalcontest_page.bind(this),
            editGlobalContestData:this.editGlobalContestData.bind(this),
            deleteGlobalChallengers:this.deleteGlobalChallengers.bind(this),
            globalcatMuldelete:this.globalcatMuldelete.bind(this),
            addpriceCard_Post:this.addpriceCard_Post.bind(this),
            addpricecardPostbyPercentage:this.addpricecardPostbyPercentage.bind(this),
            deletepricecard_data:this.deletepricecard_data.bind(this),

            // ----------custome contest---------------
            createCustomContest:this.createCustomContest.bind(this),
            importchallengersData:this.importchallengersData.bind(this),
            create_custom_page:this.create_custom_page.bind(this),
            addCustom_contestData:this.addCustom_contestData.bind(this),
            editcustomcontest_page:this.editcustomcontest_page.bind(this),
            editcustomcontest_data:this.editcustomcontest_data.bind(this),
            delete_customcontest:this.delete_customcontest.bind(this),
            makeConfirmed:this.makeConfirmed.bind(this),
            addEditmatchpricecard:this.addEditmatchpricecard.bind(this),
            addEditPriceCard_Post:this.addEditPriceCard_Post.bind(this),
            deleteMatchPriceCard:this.deleteMatchPriceCard.bind(this),
            addEditPriceCardPostbyPercentage:this.addEditPriceCardPostbyPercentage.bind(this),

            // --------------exports contests---------
            viewAllExportsContests:this.viewAllExportsContests.bind(this),
            addExpertContestPage:this.addExpertContestPage.bind(this),
            viewTeam1ExportsDatatble:this.viewTeam1ExportsDatatble.bind(this),
            viewTeam2ExportsDatatble:this.viewTeam2ExportsDatatble.bind(this),
            addExpertContestData:this.addExpertContestData.bind(this),
            editExpertContest:this.editExpertContest.bind(this),
            editExpertContestData:this.editExpertContestData.bind(this),
            
        }
    }
    async viewGlobleContests_page(req, res, next) {
        try {
            res.locals.message = req.flash();
            res.render("contest/allGlobelContests", { sessiondata: req.session.data, });

        } catch (error) {
            //  next(error);
            req.flash('error','Something went wrong please try again')
            res.redirect("/")
        }
    }
    async addGlobalContest_page(req, res, next) {
        try {
            res.locals.message = req.flash();
            const getContest = await challengersService.getContest(req);

            if (getContest.status==true) {
                res.render("contest/createGlobel", { sessiondata: req.session.data, msg:undefined, data: getContest.data });
            }else{
                req.flash('error','page not found ..error..');
                res.redirect("/");
            }

        } catch (error) {
              //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/view-all-global-contests-challengers");
        }
    }
    async addGlobalchallengersData(req, res, next) {
        try {
            res.locals.message = req.flash();
            const postGlobelchallengers = await challengersService.addGlobalchallengersData(req);
            if (postGlobelchallengers.status == true) {
                if(postGlobelchallengers.renderStatus){
                    if(postGlobelchallengers.renderStatus=='Amount'){
                        req.flash('success',postGlobelchallengers.message);
                        res.redirect(`/addpricecard/${postGlobelchallengers.data._id}`)
                    }
                    else{
                   
                        req.flash('success',postGlobelchallengers.message);
                        res.redirect('/add-global-contest-challengers');
                    }
                }
            }else if(postGlobelchallengers.status == false){
                console.log("postGlobelchallengers.message..false....",postGlobelchallengers.message)
                req.flash('error',postGlobelchallengers.message);
                res.redirect('/add-global-contest-challengers');
            }

        } catch (error) {
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/view-all-global-contests-challengers");
        }
    }
    async globalChallengersDatatable(req, res, next) {
        try {
            let limit1 = req.query.length;
            let start = req.query.start;
            let sortObject = {},
                dir, join
            let conditions = {};
            challengersModel.countDocuments(conditions).exec((err, rows) => {
                // console.log("rows....................",rows)
                let totalFiltered = rows;
                let data = [];
                let count = 1;
                challengersModel.find(conditions).skip(Number(start) ? Number(start) : '').limit(Number(limit1) ? Number(limit1) : '').exec((err, rows1) => {
                    // console.log('--------rows1-------------', rows1);
                    if (err) console.log(err);
                    //  for (let index of rows1){
                        rows1.forEach(async(index)=>{
                        let catIs=await contestCategoryModel.findOne({_id:index.contest_cat},{name:1,_id:0});
                  
                        let parseCard;
                       if(index.contest_type == 'Amount'){
                        parseCard=`<a href="/addpricecard/${index._id}" class="btn btn-sm btn-info w-35px h-35px text-uppercase" data-toggle="tooltip" title="Add / Edit"><i class="fas fa-plus"></i></a>`
                       }else{
                        parseCard=''
                       }
                        data.push({
                            's_no': `<div class="custom-control custom-checkbox">
                            <input type="checkbox" class="custom-control-input checkbox" name="checkCat" id="check${index._id}" value="${index._id}">
                            <label class="custom-control-label" for="check${index._id}"></label></div>`,
                            "count" :count,
                            "cat" :catIs?.name,
                            "entryfee":`₹ ${index.entryfee}`,
                             "win_amount":`₹ ${index.win_amount}`,
                             "maximum_user" :index.maximum_user,
                             "multi_entry" :`${index.multi_entry == 1 ? '<i class="fas fa-check text-success"></i>' : '<i class="fas fa-times text-danger"></i>'}`,
                             "is_running" :`${index.is_running == 1 ? '<i class="fas fa-check text-success"></i>' : '<i class="fas fa-times text-danger"></i>'}`,
                             "confirmed_challenge" :`${index.confirmed_challenge == 1 ? '<i class="fas fa-check text-success"></i>' : '<i class="fas fa-times text-danger"></i>'}`,
                             "is_bonus" :`${index.is_bonus == 1 ? '<i class="fas fa-check text-success"></i>' : '<i class="fas fa-times text-danger"></i>'}`,
                             "contest_type" :index.contest_type,
                             "edit":parseCard,
                             "action":`<div class="btn-group dropdown">
                             <button class="btn btn-primary text-uppercase rounded-pill btn-sm btn-active-pink dropdown-toggle dropdown-toggle-icon" data-toggle="dropdown" type="button" aria-expanded="true" style="padding:5px 11px">
                                 Action <i class="dropdown-caret"></i>
                             </button>
                             <ul class="dropdown-menu" style="opacity: 1;">
                                 <li><a class="dropdown-item waves-light waves-effect" href="/edit-global-contest-challengers/${index._id}">Edit</a></li>
                                 <li> <a class="dropdown-item waves-light waves-effect" onclick="delete_sweet_alert('/delete-global-challengers?globelContestsId=${index._id}', 'Are you sure you want to delete this data?')">Delete</a></li>
                             </ul>
                           </div>`,
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
    async addpricecard_page(req, res, next) {
        try {
            res.locals.message = req.flash();
            const getdata = await challengersService.priceCardChallengers(req);
         
            if (getdata.status == true) {
                res.render('contest/addPriceCard',{ sessiondata: req.session.data, data:getdata.challenger_Details,contentName:getdata.contest_Name,positionss:getdata.position,priceCardData:getdata.check_PriceCard,tAmount:getdata.totalAmountForPercentage})
            }else if(getdata.status == false){
                req.flash('error',getdata.message)
                res.redirect('/view-all-global-contests-challengers')
            }

        } catch (error) {
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/view-all-global-contests-challengers");
        }
    }
    async editglobalcontest_page(req, res, next) {
        try {
            res.locals.message = req.flash();
            const getdata = await challengersService.editglobalcontest(req);
      
            if (getdata.status== true) {
                res.render('contest/editGlobelContest',{ sessiondata: req.session.data, data:getdata.challengersData,contentNames:getdata.getContest});
            }else if(getdata.status == false){
                req.flash('warning',getdata.message);
                res.redirect('/view-all-global-contests-challengers');
            }

        } catch (error) {
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/view-all-global-contests-challengers");
        }
    }
    async editGlobalContestData(req, res, next) {
        try {
            res.locals.message = req.flash();
            const editContestData=await challengersService.editGlobalContestData(req);

            if(editContestData.status == true){
                req.flash('success',editContestData.message);
                res.redirect(`/edit-global-contest-challengers/${req.body.globelContestsId}`);
            }else if(editContestData.status == false){
                req.flash('error',editContestData.message);
                res.redirect(`/edit-global-contest-challengers/${req.body.globelContestsId}`);
            }

        } catch (error) {
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/view-all-global-contests-challengers");
        }
    }
    async deleteGlobalChallengers(req,res,next){
        try {
            
            const deleteChallengers=await challengersService.deleteGlobalChallengers(req);
            if(deleteChallengers){
                res.redirect("/view-all-global-contests-challengers")
            }

        } catch (error) {
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/view-all-global-contests-challengers");
    }
    }
    async globalcatMuldelete(req,res,next){
        try {
            
            const deleteManyChallengers=await challengersService.globalcatMuldelete(req);
            
            res.send({data:deleteManyChallengers});

        } catch (error) {
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/view-all-global-contests-challengers");
    }
    }
    async addpriceCard_Post(req,res,next){
        try {
            
            const postPriceData=await challengersService.addpriceCard_Post(req);
         
            if(postPriceData.status==true){
                req.flash('success',postPriceData.message)
                res.redirect(`/addpricecard/${req.body.globelchallengersId}`);
            }else if(postPriceData.status==false){
                req.flash('error',postPriceData.message)
                res.redirect(`/addpricecard/${req.body.globelchallengersId}`)
            }else{
                req.flash('error',' Page not Found ')
                res.redirect('/')
            }

        } catch (error) {
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/view-all-global-contests-challengers");
    }
    }
    async addpricecardPostbyPercentage(req,res,next){
        try{
            const postPriceData=await challengersService.addpricecardPostbyPercentage(req);
         
            if(postPriceData.status==true){
                req.flash('success',postPriceData.message)
                res.redirect(`/addpricecard/${req.body.globelchallengersId}`);
            }else if(postPriceData.status==false){
                req.flash('error',postPriceData.message)
                res.redirect(`/addpricecard/${req.body.globelchallengersId}`)
            }else{
                req.flash('error',' Page not Found ')
                res.redirect('/')
            }

        }catch(error){
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/view-all-global-contests-challengers");
        }
    }
    async deletepricecard_data(req,res,next){
        try{
            res.locals.message = req.flash();
            const deletePriceCard=await challengersService.deletepricecard_data(req);
            if(deletePriceCard.status == true){
                req.flash('success',deletePriceCard.message);
                res.redirect(`/addpricecard/${req.query.challengerId}`);
            }else if(deletePriceCard.status == false){
                req.flash('error',deletePriceCard.message);
                res.redirect(`/addpricecard/${req.query.challengerId}`);
            }else{
                req.flash('error','server error');
                res.redirect("/");
            }

        }catch(error){
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/view-all-global-contests-challengers");
        }
    }
    async createCustomContest(req,res,next){
        try{
            res.locals.message = req.flash();
            const getlunchedMatches=await challengersService.createCustomContest(req);
            
            if(getlunchedMatches.status == true){
                let mkey=req.query.matchkey
            
                res.render("contest/createCustomContest",{ sessiondata: req.session.data, listmatches:getlunchedMatches.data,matchkey:mkey,matchData:getlunchedMatches.matchData,dates:getlunchedMatches.dates});

            }else if(getlunchedMatches.status == false){

                req.flash('error',getlunchedMatches.message);
                res.redirect('/');
            }

        }catch(error){
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/");
        }
    }
    async importchallengersData(req,res,next){
        try{
            res.locals.message = req.flash();
            const data=await challengersService.importchallengersData(req);
            if(data.status == true){
                req.flash('success',data.message)
                res.redirect(`/create-custom-contest?matchkey=${req.params.matchKey}`);
            }else{
                req.flash('error',data.message)
                res.redirect(`/create-custom-contest?matchkey=${req.params.matchKey}`);
                
                
            }
        }catch(error){
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/create-custom-contest");
        }
    }
   
    async create_custom_page(req,res,next){
        try{
            res.locals.message = req.flash();
            const getlunchedMatches=await challengersService.add_CustomContest(req);
            
            if(getlunchedMatches.status == true){

                res.render("contest/createCustom",{sessiondata: req.session.data,listmatches:getlunchedMatches.data,contestData:getlunchedMatches.contestData});

            }else if(getlunchedMatches.status == false){

                req.flash('error',getlunchedMatches.message);
                
                res.redirect('/');

            }

        }catch(error){
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/create-custom-contest");
        }
    }
    async addCustom_contestData(req,res,next){
        try{
            res.locals.message = req.flash();
            const addData=await challengersService.addCustom_contestData(req);
          
            if(addData.status == true){
                if(addData.renderStatus=='Amount'){
                    req.flash('success',addData.message);
                    res.redirect(`/addEditmatchpricecard/${addData.data._id}?matchkey=${addData.data.matchkey}`)
                }
                else{
                    req.flash('success',addData.message)
                    res.redirect("/create_Match_custom");
                }
            }else if(addData.status == false){
                req.flash('error',addData.message)
                res.redirect('/create_Match_custom');
            }

        }catch(error){
            //  next(error); 
            req.flash('error','Something went wrong please try again');
            res.redirect("/create-custom-contest");
        }
    }
    async editcustomcontest_page(req,res,next){
        try{
            res.locals.message = req.flash();
            const getdata=await challengersService.editcustomcontest_page(req);
            if(getdata.status == true){
                res.render('contest/editcustomcontest',{sessiondata: req.session.data,data:getdata.data,contestData:getdata.contestData,launchMatchData:getdata.launchMatchData});
            }else if(getdata.status == false){
                req.flash("error",getdata.message);
                res.redirect('/create-custom-contest');
            }

        }catch(error){
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/create-custom-contest");
        }
    }
    async editcustomcontest_data(req,res,next){
        try{
            const editdata=await challengersService.editcustomcontest_data(req);
            if(editdata.status == true){
                req.flash('success',editdata.message);
                res.redirect(`/editcustomcontest/${req.params.MatchChallengerId}`)
            }else if(editdata.status == false){
                req.flash('error',editdata.message)
                res.redirect(`/editcustomcontest/${req.params.MatchChallengerId}`)
            }

        }catch(error){
            // console.log(error)
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/create-custom-contest");
        }
    }
    async delete_customcontest(req,res,next){
        try{
    
            const deletedata=await challengersService.delete_customcontest(req);
            if(deletedata.status==true){
                req.flash('success',deletedata.message);
                res.redirect(`/create-custom-contest?matchkey=${req.query.matchkey}`);
            }else if(deletedata.status==false){
                req.flash('error',deletedata.message)
                res.redirect(`/create-custom-contest?matchkey=${req.query.matchkey}`);
            }else{
                req.flash('error','..error..')
                res.redirect('/')
            }

        }catch(error){
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/create-custom-contest");
        }
    }
    async makeConfirmed(req,res,next){
        try{
   
            const makeConfData=await challengersService.makeConfirmed(req);
            if(makeConfData.status==true){
                req.flash('success',makeConfData.message);
                res.redirect(`/create-custom-contest?matchkey=${req.query.matchkey}`);
            }else if(makeConfData.status==false){
                req.flash('error',makeConfData.message);
                res.redirect(`/create-custom-contest?matchkey=${req.query.matchkey}`);
            }

        }catch(error){
            //  next(error);
            req.flash('error','Something went wrong please try again');
            res.redirect("/create-custom-contest");
        }
    }
    async addEditmatchpricecard(req,res,next){
        try{
    
            res.locals.message = req.flash();
            const getPriceData=await challengersService.addEditmatchpricecard(req);
            // console.log(",editPriceCard..,,,,,,,,,,",getPriceData);
            if(getPriceData.status == true){
                res.render('contest/addEditPriceCard',{sessiondata: req.session.data,data:getPriceData.challengeData,contentName:getPriceData.contest_Name,positionss:getPriceData.position,priceCardData:getPriceData.check_PriceCard,tAmount:getPriceData.totalAmountForPercentage});
            }else{
                req.flash('error',getPriceData.message);
                res.redirect("/create-custom-contest");
            }
        }catch(error){
            req.flash('error','Something went wrong please try again');
            res.redirect("/create-custom-contest");
        }
    }
    async addEditPriceCard_Post(req,res,next){
        try{
            
            const postEditPriceCard=await challengersService.addEditPriceCard_Post(req);
            if(postEditPriceCard.status==true){
                req.flash('success',postEditPriceCard.message)
                res.redirect(`/addEditmatchpricecard/${req.body.globelchallengersId}`);
            }else if(postEditPriceCard.status==false){
                req.flash('error',postEditPriceCard.message)
                res.redirect(`/addEditmatchpricecard/${req.body.globelchallengersId}`)
            }

        }catch(error){
            req.flash('error','Something went wrong please try again');
            res.redirect("/create-custom-contest");
        }
    }
    async deleteMatchPriceCard(req,res,next){
        try{
            const deletePricecardMatch=await challengersService.deleteMatchPriceCard(req);
            if(deletePricecardMatch.status == true){
                req.flash('success',deletePricecardMatch.message)
                res.redirect(`/addEditmatchpricecard/${req.query.challengerId}`)
            }else{
                req.flash('success',deletePricecardMatch.message)
                res.redirect(`/addEditmatchpricecard/${req.query.challengerId}`)
            }

        }catch(error){
            req.flash('error','Something went wrong please try again');
            res.redirect("/create-custom-contest");
        }
    }
    async addEditPriceCardPostbyPercentage(req,res,next){
        try{
            const postPriceData=await challengersService.addEditPriceCardPostbyPercentage(req);
            if(postPriceData.status==true){
                req.flash('success',postPriceData.message)
                res.redirect(`/addEditmatchpricecard/${req.body.globelchallengersId}`);
            }else if(postPriceData.status==false){
                req.flash('error',postPriceData.message)
                res.redirect(`/addEditmatchpricecard/${req.body.globelchallengersId}`)
            }

        }catch(error){
            req.flash('error','Something went wrong please try again');
            // console.log(error)
            res.redirect("/create-custom-contest");
        }
    }
    async viewTeam1ExportsDatatble(req,res,next){
        try{
            const seriesData=await listMatchModel.findOne({_id:mongoose.Types.ObjectId(req.query.matchkey)});
            let limit1 = req.query.length;
            let start = req.query.start;
            let conditions = {};
            const teamName=await teamModel.findOne({_id:mongoose.Types.ObjectId(seriesData.team1Id)})
            conditions.team=seriesData.team1Id
            // console.log("conditions......seriesData.team1Id.............",conditions)
            playersModel.countDocuments(conditions).exec((err, rows) => {
                let totalFiltered = rows;
                let data = [];
                let count = 1;
                playersModel.find(conditions).exec((err, rows1) => {
                    if (err) console.log(err);
                    // console.log("rows1...........",rows1)
                    rows1.forEach((index) => {
                       
                        data.push({
                            count:`<input type="checkbox" name="team1players[]" value="${index._id}" data-role="${index.role}" data-credit="${index.credit}" data-team="${teamName.teamName}">`,
                            captain:`<input type="radio" name="captain" required="" value="${index._id}">`,
                            voice_captain:` <input type="radio" name="vicecaptain" required="" value="${index._id}">`,
                            player_name:`<p class="us_name" >${index.player_name} </p>`,
                            player_role:`<a data-toggle="modal" data-target="#player1modal2" class="text-decoration-none text-primary pointer">${index.role}</a>`,
                            credit:`<a data-toggle="modal" data-target="#player1modal2" class="text-decoration-none text-warning pointer">${index.credit}</a>`,
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

        }catch(error){
            console.log(error)
        }
    }
    async viewTeam2ExportsDatatble(req,res,next){
        try{
            const seriesData=await listMatchModel.findOne({_id:mongoose.Types.ObjectId(req.query.matchkey)});
            let limit1 = req.query.length;
            let start = req.query.start;
            let conditions = {};
            const teamName=await teamModel.findOne({_id:mongoose.Types.ObjectId(seriesData.team2Id)})
            conditions.team=seriesData.team2Id
            // console.log("conditions......seriesData.team2Id.............",conditions)
            playersModel.countDocuments(conditions).exec((err, rows) => {
                let totalFiltered = rows;
                let data = [];
                let count = 1;
                playersModel.find(conditions).exec((err, rows1) => {
                    if (err) console.log(err);
                    // console.log("rows1...........",rows1)
                    rows1.forEach((index) => {
                       
                        data.push({
                            count:`<input type="checkbox" name="team2players[]" value="${index._id}" data-role="${index.role}" data-credit="${index.credit}" data-team="${teamName.teamName}">`,
                            captain:`<input type="radio" name="captain" required="" value="${index._id}">`,
                            voice_captain:` <input type="radio" name="vicecaptain" required="" value="${index._id}">`,
                            player_name:`<p class="us_name" >${index.player_name} </p>`,
                            player_role:`<a data-toggle="modal" data-target="#player1modal2" class="text-decoration-none text-primary pointer">${index.role}</a>`,
                            credit:`<a data-toggle="modal" data-target="#player1modal2" class="text-decoration-none text-warning pointer">${index.credit}</a>`,
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

        }catch(error){
            console.log(error)
        }
    }

    async viewAllExportsContests(req,res,next){
        try{
              res.locals.message = req.flash();
            const getlunchedMatches=await challengersService.viewAllExportsContests(req);
            
            if(getlunchedMatches.status == true){
                let mkey=req.query.matchkey
                // console.log("jnhbbbbbbbbbhh.....",getlunchedMatches.data,"nnnnn",mkey);
                res.render("contest/viewAllExportsContest",{ sessiondata: req.session.data, listmatches:getlunchedMatches.data,matchkey:mkey,matchData:getlunchedMatches.matchData,dates:getlunchedMatches.dates});

            }else if(getlunchedMatches.status == false){

                req.flash('error',getlunchedMatches.message);
                res.redirect('/');
            }


        }catch(error){
            console.log(error);
            req.flash('error','something wrong please try again letter');
            res.redirect('/');
        }
    }
    async addExpertContestPage(req,res,next){
        try{
            res.locals.message = req.flash();
            let data=await challengersService.addExpertContestPage(req);
      
            if(req.query.matchkey){
                res.render("contest/addExpertContest",{
                    sessiondata: req.session.data,
                    matchData:data.Matchdata,
                    contest_catData:data.contest_CatData,
                    matckeyData:data.matckeyData,
                    matchkey:req.query.matchkey
                })
            }else{
                res.render("contest/addExpertContest",{
                    sessiondata: req.session.data,
                    matchData:data.Matchdata,
                    contest_catData:data.contest_CatData,
                    matckeyData:undefined,
                    matchkey:undefined
                })
            }

        }catch(error){
            console.log(error)
        }
    }
   
    async addExpertContestData(req,res,next){
        try{
            
            const data=await challengersService.addExpertContestData(req);
            if(data.status){
                req.flash("success",data.message);
                res.redirect(`/view_all_experts_contest?matchkey=${req.body.matchkey}`);
            }else{
                req.flash("error",data.message);
                res.redirect(`/view_all_experts_contest`);
            }

        }catch(error){
            console.log(error)
        }
    }
    async editExpertContest(req,res,next){
        try{
            res.locals.message = req.flash();
            const data=await challengersService.editExpertContest(req);
          
            // console.log("data.matckeyData///////////////",data.matckeyData)
            if(data){
                res.render("contest/editExpertContest",{
                    sessiondata: req.session.data,
                    realData:data.realData,
                    matckeyData:data.matckeyData,
                    contest_catData:data.contest_CatData,
                    batsman1:data.batsman1,
                    batsman2:data.batsman2,
                    bowlers1:data.bowlers1,
                    bowlers2:data.bowlers2,
                    allrounder1:data.allrounder1,
                    allrounder2:data.allrounder2,
                    wk2:data.wk2,
                    wk1:data.wk1,
                    criteria:data.criteria,
                    vicecaptain:data.vicecaptain,
                    captain:data.captain
                });
            }

        }catch(error){
            console.log(error)
        }
    }
    async editExpertContestData(req,res,next){
        try{
            const data=await challengersService.editExpertContestData(req);
            if(data.status){
                req.flash("success",data.message);
                res.redirect(`/view_all_experts_contest?matchkey=${req.body.matchkey}`);
            }else{
                req.flash("error",data.message);
                res.redirect(`/edit_expert_contest/${req.params.id}?matchkey=${req.body.matchkey}`);
            }

        }catch(error){
            console.log(error)
        }
    }
}
module.exports = new challengersController();