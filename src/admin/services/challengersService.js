const res = require('express/lib/response');
const mongoose = require('mongoose');
const moment = require('moment');
const randomstring = require("randomstring");
const contestCategoryModel = require("../../models/contestcategoryModel");
const challengersModel = require("../../models/challengersModel");
const priceCardModel = require("../../models/priceCardModel");
const listMatchesModel = require("../../models/listMatchesModel");
const matchchallengersModel = require("../../models/matchChallengersModel");
const JoinLeaugeModel=require("../../models/JoinLeaugeModel");
const JoinTeamModel=require("../../models/JoinTeamModel");
const matchPlayerModel=require("../../models/matchPlayersModel");
const teamModel = require("../../models/teamModel");
const { deleteMany } = require('../../models/challengersModel');


class challengersService {
    constructor() {
        return {
            getContest: this.getContest.bind(this),
            addGlobalchallengersData: this.addGlobalchallengersData.bind(this),
            priceCardChallengers: this.priceCardChallengers.bind(this),
            editglobalcontest: this.editglobalcontest.bind(this),
            editGlobalContestData: this.editGlobalContestData.bind(this),
            deleteGlobalChallengers: this.deleteGlobalChallengers.bind(this),
            globalcatMuldelete: this.globalcatMuldelete.bind(this),
            addpriceCard_Post: this.addpriceCard_Post.bind(this),
            addpricecardPostbyPercentage: this.addpricecardPostbyPercentage.bind(this),
            deletepricecard_data: this.deletepricecard_data.bind(this),
            importchallengersData: this.importchallengersData.bind(this),
            createCustomContest: this.createCustomContest.bind(this),
            add_CustomContest: this.add_CustomContest.bind(this),
            addCustom_contestData: this.addCustom_contestData.bind(this),
            // addMatchPriceCard_page: this.addMatchPriceCard_page.bind(this),
            editcustomcontest_page: this.editcustomcontest_page.bind(this),
            editcustomcontest_data: this.editcustomcontest_data.bind(this),
            delete_customcontest: this.delete_customcontest.bind(this),
            makeConfirmed: this.makeConfirmed.bind(this),
            addEditmatchpricecard: this.addEditmatchpricecard.bind(this),
            addEditPriceCard_Post: this.addEditPriceCard_Post.bind(this),
            deleteMatchPriceCard: this.deleteMatchPriceCard.bind(this),
            addEditPriceCardPostbyPercentage: this.addEditPriceCardPostbyPercentage.bind(this),
            getTeamNameContestExports:this.getTeamNameContestExports.bind(this),

            // ------------exports contest------------------

            viewAllExportsContests:this.viewAllExportsContests.bind(this),
            addExpertContestPage:this.addExpertContestPage.bind(this),
            addExpertContestData:this.addExpertContestData.bind(this),
            editExpertContest:this.editExpertContest.bind(this),
            editExpertContestData:this.editExpertContestData.bind(this),
        }
    }
    // --------------------
    async getContest(req) {
        try {

            const getContest = await contestCategoryModel.find({}, { name: 1 });
            if (getContest) {
                return {
                    status: true,
                    data: getContest
                }
            } else {
                return {
                    status: false,
                    message: 'data not found'
                }
            }

        } catch (error) {
            throw error;
        }
    }
    async addGlobalchallengersData(req) {
        try {
            if (req.body.entryfee && req.body.win_amount && req.body.contest_type && req.body.contest_cat) {
                const checkContestName=await challengersModel.findOne({contest_name:req.body.contest_name});
                if(checkContestName){
                    return {
                        status: false,
                        message: 'Contest Name already exist..'
                    }
                }
                const checkData = await challengersModel.findOne({amount_type:req.body.amount_type,entryfee: req.body.entryfee, win_amount: req.body.win_amount, contest_type: req.body.contest_type, contest_cat: req.body.contest_cat, is_deleted: false });
                let data = {}
                if (Number(req.body.entryfee) == 0 || Number(req.body.win_amount) == 0) {
                    return {
                        status: false,
                        message: 'entryfee or win_amount can not equal to Zero'
                    }
                }
                if (checkData) {
                    // console.log("check Data.. found");
                    return {
                        status: false,
                        message: 'This contest is already exist with the same winning amount, entry fees and maximum number ,contest type ...'
                    }
                } else {
                    if (req.body.team_limit) {
                        // console.log(`....................................${req.body.team_limit}.....................//////////////////////////${Number(req.body.team_limit) > Number(process.env.TEAM_LIMIT)}.............//////////////////////////////////////////${process.env.TEAM_LIMIT}/////////////`)
                        if (Number(req.body.team_limit) == 0 || Number(req.body.team_limit) > Number(process.env.TEAM_LIMIT)) {
                            // console.log("team_limit == 0. found");
                            return {
                                status: false,
                                message: `Value of Team limit not equal to 0..or more then ${config.TEAM_LIMIT}.`
                            }
                        } else {
                            data.multi_entry = 1;
                        }
                    }
                    if (req.body.maximum_user) {
                        if (req.body.maximum_user < 2) {
                            // console.log("maximum_user < 2 found");
                            return {
                                status: false,
                                message: 'Value of maximum user not less than 2...'
                            }
                        }
                    }
                    if (req.body.winning_percentage) {
                        if (req.body.winning_percentage == 0) {
                            // console.log("winning_percentage == 0. found");
                            return {
                                status: false,
                                message: 'Value of winning percentage not equal to 0...'
                            }
                        }
                    }
                    if (req.body.bonus_percentage) {
                        if (req.body.bonus_percentage == 0) {
                            // console.log("bonus_percentage == 0. found");
                            return {
                                status: false,
                                message: 'Value of bonus percentage not equal to 0...'
                            }
                        }
                    }
                    if (!req.body.bonus_percentage) {
                        // console.log("..!req.body.bonus_percentage found");
                        data.bonus_percentage = 0
                        data.is_bonus = 0;
                    }
                    if (req.body.contest_type == 'Percentage') {
                        // console.log("..contest_type == 'Percentage' found");
                        req.body.maximum_user = '0';
                        req.body.pricecard_type = '0';
                    }
                    if (req.body.maximum_user) {
                        // console.log("..maximum_user' found");
                        data.maximum_user = req.body.maximum_user;
                    }

                    if (req.body.winning_percentage) {
                        // console.log("..winning_percentage.. found");
                        data.winning_percentage = req.body.winning_percentage;
                    }

                    if (req.body.confirmed_challenge) {
                        // console.log("..confirmed_challenge.. found");
                        data.confirmed_challenge = 1;
                    } else {
                        if (req.body.contest_type == 'Amount' && req.body.pricecard_type == 'Percentage') {
                            // console.log("..contest_type == 'Amount'.. found");
                            data.confirmed_challenge = 1;
                        }
                    }

                    if (req.body.is_running) {
                        // console.log("...is_running'.. found");
                        data.is_running = 1;
                    }
                    if (req.body.is_bonus) {
                        // console.log("....is_bonus'.. found");
                        data.is_bonus = 1;
                        data.bonus_percentage = req.body.bonus_percentage;
                    }
                    if (req.body.multi_entry) {
                        data.multi_entry = 1;
                        data.multi_entry = req.body.multi_entry;
                        data.team_limit = req.body.team_limit;
                    }
                    data.contest_type = req.body.contest_type;
                    data.pricecard_type = req.body.pricecard_type;
                    data.contest_cat = req.body.contest_cat;
                    data.contest_name=req.body.contest_name;
                    data.entryfee = req.body.entryfee;
                    data.fantasy_type=req.body.fantasy_type;
                    data.win_amount = req.body.win_amount;
                    data.amount_type=req.body.amount_type;

                    if (req.body.contest_type == 'Amount') {
                        data.winning_percentage = '0';
                    }

                    // console.log("data.....insert Cahlengers......", data)
                    const insertChallengers = new challengersModel(data);
                    const saveInsert = await insertChallengers.save();
                    if (saveInsert) {
                        return {
                            status: true,
                            renderStatus: req.body.contest_type,
                            data: saveInsert,
                            message: 'Contest Create successfully'
                        };
                    }

                }

            } else {
                return {
                    status: false,
                    message: 'please fill ..Entry Fee & win Amount & Contest Type & Contest Category '
                }
            }

        } catch (error) {
            throw error;
        }
    }
    async priceCardChallengers(req) {
        try {
            console.log("req.query,req.params..................", req.query, req.params)
            if (req.params) {
                const challenger_Details = await challengersModel.findOne({ _id: req.params.id, is_deleted: false });
                if (challenger_Details) {
                    console.log("challenger_Details..........", challenger_Details)
                    const contest_Name = await contestCategoryModel.findById({ _id: challenger_Details.contest_cat, is_deleted: false }, { name: 1, _id: 0 });
                    if (contest_Name) {
                        console.log("contest_Name..........", contest_Name)
                        const check_PriceCard = await priceCardModel.find({ challengersId: req.params.id, is_deleted: false });
                        console.log("check_PriceCard.....", check_PriceCard);
                        let totalAmountForPercentage = 0;

                        if (check_PriceCard.length == 0) {
                            let position = 0;
                            return {
                                status: true,
                                challenger_Details,
                                contest_Name,
                                position,
                                totalAmountForPercentage,
                            }
                        } else {
                            let lastIndexObject = (check_PriceCard.length) - 1;
                            // console.log("lastIndexObject............",lastIndexObject)
                            let lastObject = check_PriceCard[lastIndexObject];
                            console.log("lastObject.............", lastObject)
                            let position = lastObject.max_position
                            for (let key of check_PriceCard) {
                                totalAmountForPercentage = totalAmountForPercentage + key.total
                            }
                            // console.log("position..........price card checked..",position)
                            return {
                                status: true,
                                challenger_Details,
                                contest_Name,
                                position,
                                check_PriceCard,
                                totalAmountForPercentage
                            }
                        }

                    } else {
                        return {
                            status: false,
                            message: 'contest not found in challenges ..'
                        }
                    }

                } else {
                    return {
                        status: false,
                        message: 'challenge not found..'
                    }
                }

            } else {
                return {
                    status: false,
                    message: 'Invalid request Id'
                }
            }



        } catch (error) {
            throw error;
        }
    }

    async addpriceCard_Post(req) {
        try {
            const challenger_Details = await challengersModel.findOne({ _id: req.body.globelchallengersId });
            console.log("challenger_Details..add pricecard form data.........", challenger_Details)

            const check_PriceCard = await priceCardModel.find({ challengersId: req.body.globelchallengersId });

            if (req.body.min_position && req.body.winners && req.body.price) {
                if(Number(req.body.winners) == 0 || Number(req.body.price) == 0 ){
                    return {
                        status: false,
                        message: 'winners or price can not equal to Zero'
                    }
                }

                if (check_PriceCard.length == 0) {
                    if (challenger_Details.win_amount < ((Number(req.body.winners)) * (Number(req.body.price)))) {
                        return {
                            status: false,
                            message: 'price should be less or equal challengers winning amount'
                        }
                    } else if (challenger_Details.maximum_user < Number(req.body.winners)) {
                        return {
                            status: false,
                            message: 'number of Winner should be less or equal challengers maximum user'
                        }
                    } else {
                        console.log("......insertPriceData........../////////////////////////////////////.")
                        const insertPriceData = new priceCardModel({
                            challengersId: mongoose.Types.ObjectId(req.body.globelchallengersId),
                            winners: Number(req.body.winners),
                            price: Number(req.body.price),
                            min_position: Number(req.body.min_position),
                            max_position: (Math.abs((Number(req.body.min_position)) - (Number(req.body.winners)))),
                            total: ((Number(req.body.winners)) * (Number(req.body.price))).toFixed(2),
                            type: 'Amount'
                        })
                        let savePriceData = await insertPriceData.save();
                        if (savePriceData) {
                            return {
                                status: true,
                                message: 'price Card added successfully'
                            };
                        }
                    }


                } else {

                    let lastIndexObject = (check_PriceCard.length) - 1;
                    // console.log("lastIndexObject.........",lastIndexObject)
                    let lastObject = check_PriceCard[lastIndexObject];
                    // console.log("lastObject........",lastObject);
                    let position = lastObject.max_position

                    let totalAmountC = 0;
                    for (let key of check_PriceCard) {
                        totalAmountC = totalAmountC + key.total
                    }
                    // console.log("totalAmountC............", totalAmountC + ((Number(req.body.price) * (Number(req.body.winners)))), "....", challenger_Details.win_amount)
                    // console.log("......challenger_Details.win_amount..../////////////////////////////////////.", (totalAmountC + Number(req.body.price)) > challenger_Details.win_amount)
                    // console.log("......challenger_Details.maximum_user..../////////////////////////////////////.", challenger_Details.maximum_user < position)
                    if ((totalAmountC + ((Number(req.body.price) * (Number(req.body.winners))))) > challenger_Details.win_amount) {
                        return {
                            status: false,
                            message: 'price should be less or equal to challenge winning Amount'
                        }
                    } else if (challenger_Details.maximum_user < (position + Number(req.body.winners))) {
                        return {
                            status: false,
                            message: 'number of Winner should be less or equal challengers maximum user'
                        }
                    } else {
                        const insertPriceData = new priceCardModel({
                            challengersId: mongoose.Types.ObjectId(req.body.globelchallengersId),
                            winners: Number(req.body.winners),
                            price: Number(req.body.price),
                            min_position: position,
                            max_position: ((Number(req.body.min_position)) + (Number(req.body.winners))),
                            total: ((Number(req.body.winners)) * (Number(req.body.price))).toFixed(2),
                            type: 'Amount'
                        })
                        let savePriceData = await insertPriceData.save();
                        if (savePriceData) {
                            return {
                                status: true,
                                message: 'price Card added successfully'
                            };
                        }
                    }

                }

            }

        } catch (error) {
            throw error;
        }
    }

    async editglobalcontest(req) {
        try {
            if (req.params.id) {
                console.log("req.params.id................", req.params.id)
                const globalcontestdata = await challengersModel.aggregate([{
                    $match: {
                        "_id": mongoose.Types.ObjectId(req.params.id)
                    }
                }, {
                    $lookup: {
                        from: 'contestcategories',
                        localField: 'contest_cat',
                        foreignField: '_id',
                        as: 'contentCatName'
                    }
                }, {
                    $unwind: "$contentCatName"
                }])
                if (globalcontestdata.length > 0) {
                    const getContest = await contestCategoryModel.find({ is_deleted: false }, { name: 1 });
                    console.log("globalcontestdata............", globalcontestdata)
                    if (getContest.length > 0) {
                        return {
                            status: true,
                            challengersData: globalcontestdata[0], getContest
                        };
                    } else {
                        return {
                            status: false,
                            message: 'contest Category not found..'
                        }
                    }
                } else {
                    return {
                        status: false,
                        message: 'challenge && contest category not found.. '
                    }
                }


            } else {
                return {
                    status: false,
                    message: 'Invalid contest Id'
                }
            }


        } catch (error) {
            throw error;
        }
    }
    async editGlobalContestData(req) {
        try {
            if (req.body.entryfee && req.body.win_amount && req.body.contest_type && req.body.contest_cat) {
                const checkContestName=await challengersModel.findOne({_id:{$ne: req.body.globelContestsId},contest_name:req.body.contest_name});
                if(checkContestName){
                    return {
                        status: false,
                        message: 'Contest Name already exist..'
                    }
                }
                if (Number(req.body.entryfee) == 0 || Number(req.body.win_amount) == 0 || Number(req.body.maximum_user) == 0) {
                    return {
                        status: false,
                        message: 'entryfee or win amount or maximum user can not equal to Zero'
                    }
                }
                let data = {}
                // console.log("req.body", req.body, "req.params", req.params, "req.query", req.query)
                const challengerData = await challengersModel.findOne({ _id: req.body.globelContestsId });
                // console.log("challengerData......................", challengerData)
                const checkData = await challengersModel.findOne({ _id: { $ne: req.body.globelContestsId }, entryfee: req.body.entryfee, win_amount: req.body.win_amount, contest_type: req.body.contest_type, contest_cat: req.body.contest_cat, is_deleted: false });
        
                if (checkData) {
                    // console.log("check Data.. found");
                    return {
                        status: false,
                        message: 'This contest is already exist with the same winning amount, entry fees and maximum number ,contest type ...'
                    }
                } else {
                    if (req.body.team_limit) {
                        if (Number(req.body.team_limit) == 0 || Number(req.body.team_limit) > Number(process.env.TEAM_LIMIT)) {
                            // console.log("team_limit == 0. found");
                            return {
                                status: false,
                                message: `Value of Team limit not equal to 0..or more then ${config.TEAM_LIMIT}.`
                            }
                        } else {
                            data.multi_entry = 1;
                        }
                    }

                    if (req.body.multi_entry) {
                        req.body.multi_entry = 1;
                    } else {
                        req.body.multi_entry = 0;
                    }
                    if (req.body.confirmed_challenge) {
                        req.body.confirmed_challenge = 1;
                    } else {
                        req.body.confirmed_challenge = 0;
                    }

                    if (req.body.is_running) {
                        req.body.is_running = 1;
                    } else {
                        req.body.is_running = 0;
                    }


                    if (req.body.maximum_user) {
                        if (req.body.maximum_user < 2) {
                            // console.log("maximum_user < 2 found");
                            return {
                                status: false,
                                message: 'Value of maximum user not less than 2...'
                            }
                        }
                    }
                    if (req.body.winning_percentage) {
                        if (req.body.winning_percentage == 0) {
                            // console.log("winning_percentage == 0. found");
                            return {
                                status: false,
                                message: 'Value of winning percentage not equal to 0...'
                            }
                        }
                    }
                    if (req.body.bonus_percentage) {
                        if (req.body.bonus_percentage == 0) {
                            // console.log("bonus_percentage == 0. found");
                            return {
                                status: false,
                                message: 'Value of bonus percentage not equal to 0...'
                            }
                        }
                    }
                    if (!req.body.bonus_percentage) {
                        // console.log("..!req.body.bonus_percentage found");
                        req.body.bonus_percentage = 0
                        req.body.is_bonus = 0;
                    }
                    if (!req.body.maximum_user) {
                        req.body.maximum_user = 0
                    }
                    if (!req.body.winning_percentage) {
                        req.body.winning_percentage = 0;
                    }
                    if (Number(req.body.win_amount) != Number(challengerData.win_amount)) {
                        // console.log("delete Price Card By win_Amount")
                        const deletepriceCard = await priceCardModel.deleteMany({ challengersId: challengerData._id });
                        // console.log("deletepriceCard..", deletepriceCard)
                    }
                    if (req.body.contest_type == 'Percentage') {
                        // console.log("..contest_type == 'Percentage' found");
                        req.body.maximum_user = 0;
                        req.body.pricecard_type = 0;
                        const checkPriceCard = await priceCardModel.findOne({ challengersId: challengerData._id });
                        if (checkPriceCard) {
                            const deletepriceCard = await priceCardModel.deleteMany({ challengersId: challengerData._id });
                        }
                    }
                    if (req.body.contest_type == 'Amount') {
                        if (!req.body.pricecard_type) {
                            req.body.pricecard_type = 'Amount'
                        }
                        req.body.winning_percentage = 0
                    }
                    if (req.body.maximum_user) {
                        // console.log("..maximum_user' found");
                        data.maximum_user = req.body.maximum_user;
                    }

                    if (req.body.winning_percentage) {
                        // console.log("..winning_percentage.. found");
                        data.winning_percentage = req.body.winning_percentage;
                    }

                    if (req.body.confirmed_challenge) {
                        // console.log("..confirmed_challenge.. found");
                        data.confirmed_challenge = 1;
                    } else {
                        data.confirmed_challenge = 0;
                    }

                    if (req.body.is_running) {
                        // console.log("...is_running'.. found");
                        data.is_running = 1;
                    } else {
                        data.is_running = 0;
                    }
                    if (req.body.is_bonus) {
                        // console.log("....is_bonus'.. found");
                        data.is_bonus = 1;
                        data.bonus_percentage = req.body.bonus_percentage;
                    } else {
                        data.is_bonus = 0;
                        data.bonus_percentage = 0;
                    }
                    if (req.body.multi_entry) {
                        data.multi_entry = 1;
                        data.multi_entry = req.body.multi_entry;
                        data.team_limit = req.body.team_limit;
                    } else {
                        data.multi_entry = 0;
                    }
                    if (Number(req.body.maximum_user) != Number(challengerData.maximum_user)) {
                        const checkPriceCard = await priceCardModel.findOne({ challengersId: challengerData._id });
                        if (checkPriceCard) {
                            const deletepriceCard = await priceCardModel.deleteMany({ challengersId: challengerData._id });
                        }
                    }
                    if (req.body.pricecard_type != challengerData.pricecard_type) {
                        const checkPriceCard = await priceCardModel.findOne({ challengersId: challengerData._id });
                        if (checkPriceCard) {
                            const deletepriceCard = await priceCardModel.deleteMany({ challengersId: challengerData._id });
                        }
                    }
                    data.contest_type = req.body.contest_type;
                    data.pricecard_type = req.body.pricecard_type;
                    data.contest_cat = req.body.contest_cat;
                    data.contest_name=req.body.contest_name;
                    data.entryfee = req.body.entryfee;
                    data.win_amount = req.body.win_amount;
                    data.fantasy_type = req.body.fantasy_type;
                    data.amount_type=req.body.amount_type;
                    if (req.body.contest_type == 'Amount') {
                        data.winning_percentage = 0;
                    }
                    // console.log("data................", data)
                    const updateChallengers = await challengersModel.updateOne({ _id: mongoose.Types.ObjectId(req.body.globelContestsId) }, { $set: data });
                    if (updateChallengers.modifiedCount > 0) {
                        return {
                            status: true,
                            message: 'globel centest successfully update'
                        };
                    } else {
                        return {
                            status: false,
                            message: "Not Able To Update Globel Contest  ..ERROR.."
                        }
                    }
                }

            }


        } catch (error) {
            throw error;
        }
    }
    async deleteGlobalChallengers(req) {
        try {

            const deleteChallenger = await challengersModel.deleteOne({ _id: req.query.globelContestsId });
            if (deleteChallenger.deletedCount == 1) {
                const deletePriceCard=await priceCardModel.deleteMany({challengersId:req.query.globelContestsId});
                console.log("deletePriceCard......",deletePriceCard)
                
                return true;
            } else {
                return false;
            }

        } catch (error) {
            throw error;
        }
    }
    async globalcatMuldelete(req) {
        try {
            console.log("---------------------", req.body)
            let deleteIds=req.body.deletedId;
            for (let key of deleteIds) {
                const deleteChallenger = await challengersModel.deleteOne({ _id: mongoose.Types.ObjectId(key) })
                const deletePriceCard=await priceCardModel.deleteMany({challengersId:mongoose.Types.ObjectId(key)});
                console.log("deletePriceCard......",deletePriceCard)
            }
            if (deleteIds.length == 0) {
                return true;
            }

        } catch (error) {
            throw error;
        }
    }
    async addpricecardPostbyPercentage(req) {
        try {
            console.log("req.body......//////////////////////////////////////////////////.percentage.", req.body)
            const challenger_Details = await challengersModel.findOne({ _id: req.body.globelchallengersId });
            console.log("challenger_Details..add pricecard form data.........", challenger_Details)
            if(Number(req.body.price_percent) == 0 || Number(req.body.winners) == 0 ){
                return {
                    status: false,
                    message: 'price percent or winners can not equal to Zero'
                }
            }
            const check_PriceCard = await priceCardModel.find({ challengersId: req.body.globelchallengersId });
            let min_position = req.body.min_position;
            let winners
            let price_percent
            let price
            console.log("Percentage......", req.body.Percentage)
            if (req.body.Percentage) {
                console.log(" i am in percentage...........................................///////////////////")
                if (req.body.user_selection == 'number') {
                    winners = Number(req.body.winners);
                    price_percent = (Number(req.body.price_percent));
                    price = ((challenger_Details.win_amount) * ((Number(req.body.price_percent)) / 100)).toFixed(2);
                    // console.log('.......in Number.EPSILON..........', winners, price_percent, price)
                } else {
                    winners = ((challenger_Details.maximum_user) * ((Number(req.body.winners)) / 100)).toFixed(2)
                    price_percent = (Number(req.body.price_percent));
                    price = ((challenger_Details.win_amount) * ((Number(req.body.price_percent)) / 100)).toFixed(2);
                    // console.log('.......in percentegae.EPSILON..........', winners, price_percent, price)
                }
            } else {
                return {
                    status: false,
                    message: 'is not Percentage'
                }
            }
            if (min_position && winners && price_percent) {
                if (winners <= 0) {
                    console.log("jhbgfhjk.....winner is  ..........zero")
                    return {
                        status: false,
                        message: 'winner should not equal or less then zero'
                    }
                }
                console.log("jgvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv", min_position, winners, price_percent)
                if (min_position && winners && price_percent) {
                    if (check_PriceCard.length == 0) {
                        if (challenger_Details.win_amount < ((Number(winners)) * (Number(price)))) {
                            return {
                                status: false,
                                message: 'price should be less or equal challengers winning amount'
                            }
                        } else if (challenger_Details.maximum_user < Number(winners)) {
                            return {
                                status: false,
                                message: 'number of Winner should be less or equal challengers maximum user'
                            }
                        } else {
                            console.log("......insertPriceData........../////////////////////////////////////.")

                            const insertPriceData = new priceCardModel({
                                challengersId: mongoose.Types.ObjectId(req.body.globelchallengersId),
                                winners: (Number(winners)),
                                price: (Number(price)),
                                price_percent: (Number(price_percent)),
                                min_position: (Number(min_position)),
                                max_position: (Math.abs((Number(min_position)) - (Number(winners)))),
                                total: ((Number(winners)) * (Number(price))),
                                type: 'Amount'
                            })
                            let savePriceData = await insertPriceData.save();
                            if (savePriceData) {
                                return {
                                    status: true,
                                    message: 'price Card added successfully'
                                };
                            }
                        }


                    } else {

                        let lastIndexObject = (check_PriceCard.length) - 1;
                        // console.log("lastIndexObject.........",lastIndexObject)
                        let lastObject = check_PriceCard[lastIndexObject];
                        // console.log("lastObject........",lastObject);
                        let position = lastObject.max_position

                        let totalAmountC = 0;
                        for (let key of check_PriceCard) {
                            totalAmountC = totalAmountC + key.total
                        }
                        console.log("totalAmountCt.....", totalAmountC, Number(price), (Number(winners)), challenger_Details.win_amount)
                        console.log("totalAmountCt.....", (totalAmountC + ((Number(price) * (Number(winners))))) > challenger_Details.win_amount)
                        console.log(",,,,,,,,,,,,,,,,,,,,,,,,", (challenger_Details.maximum_user < (position + Number(winners))))
                        if ((totalAmountC + ((Number(price) * (Number(winners))))) > challenger_Details.win_amount) {
                            return {
                                status: false,
                                message: 'price should be less or equal to challengers winning Amount'
                            }
                        } else if (challenger_Details.maximum_user < (position + Number(winners))) {
                            return {
                                status: false,
                                message: 'number of Winner should be less or equal challengers maximum user'
                            }
                        } else {
                            console.log("iinsertsssss psotgh..percentage.. price card in number")
                            const insertPriceData = new priceCardModel({
                                challengersId: mongoose.Types.ObjectId(req.body.globelchallengersId),
                                winners: (Number(winners)),
                                price: (Number(price)),
                                price_percent: (Number(price_percent)),
                                min_position: (position),
                                max_position: ((Number(min_position)) + (Number(winners))),
                                total: ((Number(winners)) * (Number(price))),
                                type: 'Amount'
                            })
                            console.log("insertPriceData..........", insertPriceData)
                            let savePriceData = await insertPriceData.save();
                            if (savePriceData) {
                                return {
                                    status: true,
                                    message: 'price Card added successfully'
                                }
                            } else {
                                return {
                                    status: false,
                                    message: 'data not insert ..error..'
                                }
                            }
                        }

                    }

                }
            } else {
                console.log("i am here last end")
                return {
                    status: false,
                    message: 'please enter proper values'
                }
            }

        } catch (error) {
            return true;
        }
    }
    async deletepricecard_data(req) {
        try {
            console.log("req.query", req.body, req.params)
            const deletequery = await priceCardModel.deleteOne({ _id: req.params.id });
            console.log("deletequery........", deletequery)
            if (deletequery.deletedCount == 1) {
                return {
                    status: true,
                    message: 'delete successfully'
                }
            } else if (deletequery.deletedCount == 0) {
                return {
                    status: false,
                    message: 'unable to delete'
                }
            }

        } catch (error) {
            throw error;
        }
    }
    async createCustomContest(req) {
        try {
            let curTime = moment().format("YYYY-MM-DD HH:mm:ss");
            // console.log("curTime.........",curTime)
            // start_date: { $gt: curTime }
            const getLunchedMatch = await listMatchesModel.find({ status: "notstarted", launch_status: "launched",  }, { fantasy_type: 1, name: 1 });
            // console.log("getLunchedMatch..............",getLunchedMatch);
            let getlistofMatches
            let anArray = [];
            if (req.query.matchkey) {
                let qukey = req.query.matchkey
                console.log("req.query.matchkey", qukey)
                getlistofMatches = await matchchallengersModel.find({ matchkey: mongoose.Types.ObjectId(qukey) });
                for await (let keyy of getlistofMatches) {
                    let obj = {};
                    let newDate = moment(keyy.createdAt).format('MMM Do YY');
                    let day = moment(keyy.createdAt).format('dddd');
                    let time = moment(keyy.createdAt).format('h:mm:ss a');
                    if(keyy.is_expert == 1 ){
                    obj.newDate = newDate;
                    obj.day = day;
                    obj.time = time; 
                    obj.contest_cat = keyy.contest_cat;
                    obj.matchkey = keyy.matchkey;
                    obj.fantasy_type = keyy.fantasy_type
                    obj.entryfee = keyy.entryfee;
                    obj.win_amount = keyy.win_amount;
                    obj.status = keyy.status;
                    obj.contest_type = keyy.contest_type;
                    obj.winning_percentage = keyy.winning_percentage;
                    obj.is_bonus = keyy.is_bonus;
                    obj.bonus_percentage = keyy.bonus_percentage;
                    obj.amount_type=keyy.amount_type;
                    obj.c_type = keyy.c_type;
                    obj.is_private = keyy.is_private;
                    obj.is_running = keyy.is_running;
                    obj.confirmed_challenge = keyy.confirmed_challenge;
                    obj.multi_entry = keyy.multi_entry;
                    obj._id = keyy._id;
                    obj.joinedusers = keyy.joinedusers;
                    obj.team_limit = keyy.team_limit;

                    }else{
                    obj.newDate = newDate;
                    obj.day = day;
                    obj.time = time;
                    obj._id = keyy._id;
                    obj.contest_cat = keyy.contest_cat;
                    obj.challenge_id = keyy.challenge_id;
                    obj.matchkey = keyy.matchkey;
                    obj.fantasy_type = keyy.fantasy_type;
                    obj.entryfee = keyy.entryfee;
                    obj.win_amount = keyy.win_amount;
                    obj.maximum_user = keyy.maximum_user;
                    obj.status = keyy.status;
                    obj.joinedusers = keyy.joinedusers;
                    obj.contest_type = keyy.contest_type;
                    obj.contest_name=keyy?.contest_name;
                    obj.mega_status = keyy.mega_status;
                    obj.winning_percentage = keyy.winning_percentage;
                    obj.is_bonus = keyy.is_bonus;
                    obj.bonus_percentage = keyy.bonus_percentage;
                    obj.pricecard_type = keyy.pricecard_type;
                    obj.minimum_user = keyy.minimum_user;
                    obj.confirmed_challenge = keyy.confirmed_challenge;
                    obj.multi_entry = keyy.multi_entry;
                    obj.team_limit = keyy.team_limit;
                    obj.c_type = keyy.c_type;
                    obj.is_private = keyy.is_private;
                    obj.is_running = keyy.is_running;
                    obj.is_deleted = keyy.is_deleted;
                    obj.matchpricecards = keyy.matchpricecards;
                    obj.amount_type=keyy.amount_type;
                    }
                   

                    anArray.push(obj)
                }

            } else {
                getlistofMatches = []
            }
            // console.log("anArray.................//////////.anArray.............................................", anArray)
            if (getLunchedMatch) {
                return {
                    matchData: anArray,
                    matchkey: req.body.matchkey,
                    data: getLunchedMatch,
                    status: true
                }
            } else {
                return {
                    status: false,
                    message: 'can not get list-Matches data'
                }
            }
        } catch (error) {
            throw error;
        }
    }
    async importchallengersData(req) {
        try {
            const findmatch = await listMatchesModel.findOne({ _id: mongoose.Types.ObjectId(req.params.matchKey) });
            if (findmatch) {
                const findleauges = await challengersModel.find({ fantasy_type:{$regex: new RegExp(findmatch.fantasy_type.toLowerCase(), "i")} });
                // console.log("findleauges....////////....",findleauges)
                let anArray = [];
                if (findleauges.length > 0) {
                    for await(let key1 of findleauges) {
                        const findchallengeexist = await matchchallengersModel.find({ matchkey: mongoose.Types.ObjectId(req.params.matchKey), challenge_id: mongoose.Types.ObjectId(key1._id) });
                        if (findchallengeexist.length == 0) {
                            let data = {};
                            data['challenge_id'] = mongoose.Types.ObjectId(key1._id);
                            data['contest_cat'] = mongoose.Types.ObjectId(key1.contest_cat);
                            data['contest_type'] = key1.contest_type;
                            data['winning_percentage'] = key1.winning_percentage;
                            data['is_bonus'] = key1.is_bonus;
                            data['bonus_percentage'] = key1.bonus_percentage;
                            data['pricecard_type'] = key1.pricecard_type;
                            data['entryfee'] = key1.entryfee;
                            data['win_amount'] = key1.win_amount;
                            data['maximum_user'] = key1.maximum_user;
                            data['status'] = 'opened';
                            data['confirmed_challenge'] = key1.confirmed_challenge;
                            data['is_running'] = key1.is_running;
                            data['multi_entry'] = key1.multi_entry;
                            data['team_limit']=key1.team_limit;
                            data['matchkey'] = mongoose.Types.ObjectId(req.params.matchKey);
                            data['contest_name']=key1.contest_name;
                            data['amount_type']=key1.amount_type;
                            const insertData = new matchchallengersModel(data);
                            let saveInsert = await insertData.save();

                            let findpricecrads = await priceCardModel.find({ challengersId: key1._id });
                            // console.log("findpricecrads..................priceCard.........///////........", findpricecrads)
                            
                            if (findpricecrads.length > 0) {
                                for await(let key2 of findpricecrads) {
                                    let pdata = {};
                                    pdata['challengeId'] = mongoose.Types.ObjectId(key2.challengersId);
                                    pdata['matchkey'] = mongoose.Types.ObjectId(req.params.matchKey);
                                    pdata['winners'] = key2.winners;
                                    pdata['price'] = key2.price;
                                    if (key2.price_percent) {
                                        pdata['price_percent'] = key2.price_percent;
                                    }
                                    pdata['min_position'] = key2.min_position;
                                    pdata['max_position'] = key2.max_position;
                                    pdata['total'] = key2.total;
                                    pdata['type'] = key2.type;

                                    const updateInsert = await matchchallengersModel.updateOne({ _id: mongoose.Types.ObjectId(saveInsert._id) }, {
                                            $push: {
                                                matchpricecards: pdata
                                            }
                                        })
                                        // console.log("updateInsert.................", updateInsert)
                                }
                            }
                        }else{
                            let data = {};
                            data['challenge_id'] = mongoose.Types.ObjectId(key1._id);
                            data['contest_cat'] = mongoose.Types.ObjectId(key1.contest_cat);
                            data['contest_type'] = key1.contest_type;
                            data['winning_percentage'] = key1.winning_percentage;
                            data['is_bonus'] = key1.is_bonus;
                            data['bonus_percentage'] = key1.bonus_percentage;
                            data['pricecard_type'] = key1.pricecard_type;
                            data['entryfee'] = key1.entryfee;
                            data['win_amount'] = key1.win_amount;
                            data['maximum_user'] = key1.maximum_user;
                            data['status'] = 'opened';
                            data['confirmed_challenge'] = key1.confirmed_challenge;
                            data['is_running'] = key1.is_running;
                            data['multi_entry'] = key1.multi_entry;
                            data['team_limit']=key1.team_limit;
                            data['matchkey'] = mongoose.Types.ObjectId(req.params.matchKey);
                            data['contest_name']=key1.contest_name;
                            data['amount_type']=key1.amount_type;
                            let arrayofPriceCard=[];
                            let findpricecrads = await priceCardModel.find({ challengersId: key1._id });
                            console.log("findpricecrads..................priceCard.........///////........", findpricecrads)
                            if (findpricecrads.length > 0) {
                                for await(let key2 of findpricecrads) {
                                    let pdata = {};
                                    pdata['challengeId'] = mongoose.Types.ObjectId(key2.challengersId);
                                    pdata['matchkey'] = mongoose.Types.ObjectId(req.params.matchKey);
                                    pdata['winners'] = key2.winners;
                                    pdata['price'] = key2.price;
                                    if (key2.price_percent) {
                                        pdata['price_percent'] = key2.price_percent;
                                    }
                                    pdata['min_position'] = key2.min_position;
                                    pdata['max_position'] = key2.max_position;
                                    pdata['total'] = key2.total;
                                    pdata['type'] = key2.type;
                                    arrayofPriceCard.push(pdata);
                                }
                            }
                            data['matchpricecards']= arrayofPriceCard;
                            const updateExitingChallenge = await matchchallengersModel.updateOne({ matchkey: mongoose.Types.ObjectId(req.params.matchKey), challenge_id: mongoose.Types.ObjectId(key1._id) },{$set:data});

                        }
                    }
                    return {
                        status: true,
                        message: 'Challenge imported successfully'
                    }

                }
                return {
                    status: false,
                    message: 'Challenge not Found ..error..'
                }

            }
            return {
                status: false,
                message: 'Challenge not imported ..error..'
            }
        } catch (error) {
            throw error;
        }
    }
    async add_CustomContest(req) {
        try {
            const getLunchedMatchinAddContest = await listMatchesModel.find({ status: "notstarted", launch_status: "launched" }, { fantasy_type: 1, name: 1 });
            const getContest = await contestCategoryModel.find({}, { name: 1 });

            if (getLunchedMatchinAddContest) {
                return {
                    data: getLunchedMatchinAddContest,
                    contestData: getContest,
                    status: true
                }
            } else {
                return {
                    status: false,
                    message: 'can not get list-Matches data'
                }
            }
        } catch (error) {
            throw error
        }
    }
    async addCustom_contestData(req) {
        try {
            let curTime = moment().format("YYYY-MM-DD HH:mm:ss");
            if (req.body.entryfee && req.body.win_amount && req.body.contest_type && req.body.contest_cat) {
                if (Number(req.body.entryfee) == 0 || Number(req.body.win_amount) == 0 ) {
                    return {
                        status: false,
                        message: 'entryfee or win_amount can not equal to Zero'
                    }
                }
                const findAllListmatches = await listMatchesModel.find({ fantasy_type: req.body.fantasy_type, launch_status: 'launched', start_date: curTime }, { name: 1, real_matchkey: 1 });
                let obj = {}
                    // const checkListMatch
                if (req.body.maximum_user) {
                    if (req.body.maximum_user < 2 || !req.body.maximum_user) {
                        return {
                            status: false,
                            message: 'Value of maximum user not less than 2...'
                        }
                    }
                }
                if (req.body.winning_percentage) {
                    if (req.body.winning_percentage == 0) {
                        return {
                            status: false,
                            message: 'Value of winning percentage not equal to 0...'
                        }
                    }
                }

                if (req.body.bonus_percentage) {
                    if (req.body.bonus_percentage == 0) {
                        return {
                            status: false,
                            message: 'Value of bonus percentage not equal to 0..'
                        }
                    }
                }
                if (!req.body.maximum_user) {
                    req.body.maximum_user = 0;
                }
                if (!req.body.winning_percentage) {
                    req.body.winning_percentage = 0;
                }
                if (req.body.contest_type == 'Percentage') {
                    req.body.maximum_user = '0';
                    req.body.pricecard_type = '0';
                }
                if (req.body.contest_type == 'Amount') {
                    req.body.winning_percentage = '0';
                }
                if (req.body.multientry_limit) {
                    if (req.body.multientry_limit == 0) {
                        return {
                            status: true,
                            message: 'Value of Team limit not equal to 0...'
                        }
                    } else {
                        obj.multi_entry = 1;
                    }
                }
                if (req.body.team_limit) {
                    if (Number(req.body.team_limit) == 0|| Number(req.body.team_limit) > Number(process.env.TEAM_LIMIT)) {
                        return {
                            status: false,
                            message: `Value of Team limit not equal to 0..or more then ${config.TEAM_LIMIT}.`
                        }
                    } else {
                        obj.multi_entry = 1;
                    }
                }
                if (req.body.maximum_user) {
                    obj.maximum_user = req.body.maximum_user;
                }

                if (req.body.created_by) {
                    if (!req.body.created_by) {
                        obj.created_by = req.body.created_by;
                        obj.is_private = 1;
                        obj.is_admin = 1;
                    }
                }
                if (req.body.winning_percentage) {
                    obj.winning_percentage = req.body.winning_percentage;
                }

                if (req.body.confirmed_challenge) {
                    obj.confirmed_challenge = 1;
                } else {
                    if (req.body.contest_type == 'Amount' && req.body.pricecard_type == 'Percentage') {
                        obj.confirmed_challenge = 1;
                    }
                }
                if (req.body.is_running) {
                    obj.is_running = 1;
                }
                if (req.body.is_bonus) {
                    obj.is_bonus = 1;
                    obj.bonus_percentage = req.body.bonus_percentage;
                }
                if (req.body.multi_entry) {
                    obj.multi_entry = 1;
                    obj.multi_entry = req.body.multi_entry;
                    obj.team_limit = req.body.team_limit;
                }
                obj.contest_type = req.body.contest_type;
                obj.pricecard_type = req.body.pricecard_type;
                obj.contest_cat = req.body.contest_cat;
                obj.contest_name=req.body.contest_name;
                obj.entryfee = req.body.entryfee;
                obj.win_amount = req.body.win_amount;
                obj.matchkey = req.body.matchkey;
                obj.status = 'opened';
                obj.fantasy_type = req.body.fantasy_type;
                obj.amount_type=req.body.amount_type;
                const insertMatch = new matchchallengersModel(obj);
                let saveMatch = await insertMatch.save();
                // console.log("saveMatch..........", saveMatch)
                if (saveMatch) {
                    return {
                        // matchChallengerId:saveMatch._id,
                        status: true,
                        message: 'Successfully created contest',
                        renderStatus: req.body.contest_type,
                        data: saveMatch,
                    }
                } else {
                    return {
                        status: false,
                        message: 'contest not created ..error..'
                    }
                }
            }




        } catch (error) {
            throw error;
        }
    }
    async addMatchPriceCard_page(req) {
        try {
            console.log('....', req.params, req.body, req.query)
            // addPricecard panding hai  custem contest wala

        } catch (error) {
            throw error
        }
    }
    async editcustomcontest_page(req) {
        try {
            const getDatas = await matchchallengersModel.findOne({ _id: mongoose.Types.ObjectId(req.params.MatchChallengerId) });
            const getLunchedMatchinAddContest = await listMatchesModel.find({ status: "notstarted", launch_status: "launched" }, { fantasy_type: 1, name: 1 });
            const getContest = await contestCategoryModel.find({}, { name: 1 });
            console.log(".....matchChallenger getDatas.........", getDatas, "....getLunchedMatchinAddContest......", getLunchedMatchinAddContest, "...getContest.........", getContest);
            if (getDatas) {
                return {
                    status: true,
                    data: getDatas,
                    launchMatchData: getLunchedMatchinAddContest,
                    contestData: getContest
                }
            } else {
                return {
                    status: false,
                    message: 'match challenge not found..'
                }
            }

        } catch (error) {
            throw error;
        }
    }
    async editcustomcontest_data(req) {
        try {
            if (req.body.entryfee && req.body.win_amount && req.body.contest_type && req.body.contest_cat) {
                const challengers = await matchchallengersModel.findOne({ _id: req.params.MatchChallengerId });
                
                if (challengers) {
                    let data = {}
                    if (req.body.team_limit) {
                        if (req.body.team_limit == 0) {
                            return {
                                status: false,
                                message: 'Value of multientry limit not equal to 0...'
                            }
                        } else {
                            data.multi_entry = 1;
                        }
                    }
                    if (req.body.multi_entry) {
                        req.body.multi_entry = 1;
                    } else {
                        req.body.multi_entry = 0;
                    }
                    if (req.body.confirmed_challenge) {
                        req.body.confirmed_challenge = 1;
                    } else {
                        req.body.confirmed_challenge = 0;
                    }
                    if (req.body.is_running) {
                        req.body.is_running = 1;
                    } else {
                        req.body.is_running = 0;
                    }
                    if (req.body.maximum_user) {
                        if (req.body.maximum_user < 2) {
                            return {
                                status: false,
                                message: 'Value of maximum user not less than 2...'
                            }
                        }
                    }
                    if (req.body.winning_percentage) {
                        if (req.body.winning_percentage == 0) {
                            return {
                                status: false,
                                message: 'Value of winning percentage not equal to 0...'
                            }
                        }
                    }
                    if (req.body.bonus_percentage) {
                        if (req.body.bonus_percentage == 0) {
                            return {
                                status: false,
                                message: 'Value of winning percentage not equal to 0...'
                            }
                        }
                    }
                    if (!req.body.bonus_percentage) {
                        req.body.bonus_percentage = 0;
                        req.body.is_bonus = 0;
                    }
                    if (!req.body.maximum_user) {
                        req.body.maximum_user = 0;
                    }
                    if (!req.body.winning_percentage) {
                        req.body.winning_percentage = 0;
                    }
                    const findJoinedLeauges=await JoinLeaugeModel.find({challengeid:req.params.MatchChallengerId});
                    if(findJoinedLeauges.length>0){
                        return{
                            status:false,
                            message:'You cannot edit this challenge now!'
                        }
                    }
                    if (req.body.contest_type == 'Percentage') {
                        req.body.maximum_user = '0';
                        req.body.pricecard_type = '0';
                        data.matchpricecards=[]
                    }
                    if (req.body.contest_type == 'Amount') {
                        req.body.winning_percentage = '0';
                    }
                    req.body.status = 'opened';
                    
                    
                    if (!req.body.pricecard_type) {
                        if (req.body.pricecard_type == 'Amount') {
                            data.matchpricecards = [];
                        } else if (req.body.pricecard_type == 'Percentage') {
                            data.matchpricecards=[]
                        }
                    }
                    if (req.body.contest_type == 'Amount') {
                        if (!req.body.pricecard_type) {
                            req.body.pricecard_type = 'Amount';
                        }
                        req.body.winning_percentage = '0';
                    }
                    if (req.body.maximum_user) {
                        data.maximum_user = req.body.maximum_user;
                    }
                    if (req.body.winning_percentage) {
                        data.winning_percentage = req.body.winning_percentage;
                    }
                    if (req.body.confirmed_challenge) {
                        data.confirmed_challenge = 1;
                    } else {
                        data.confirmed_challenge = 0;
                    }
                    if (req.body.is_running) {
                        data.is_running = 1;
                    } else {
                        data.is_running = 0;
                    }
                    if (req.body.is_bonus) {
                        data.is_bonus = 1;
                        data.bonus_percentage = req.body.bonus_percentage;
                    } else {
                        data.is_bonus = 0;
                        data.bonus_percentage = 0;
                    }
                    if (req.body.multi_entry) {
                        data.multi_entry = 1;
                        data.multi_entry = req.body.multi_entry;
                        data.team_limit = req.body.team_limit;
                    } else {
                        data.multi_entry = 0;
                    }
                    console.log("(Number(req.body.win_amount) != Number(challengers.win_amount))..",(Number(req.body.win_amount) != Number(challengers.win_amount)))
                    if (Number(req.body.win_amount) != Number(challengers.win_amount)) {
                        console.log("delete Price Card By win_Amount")
                      
                        data.matchpricecards=[]
                    }
                    console.log("Number(req.body.maximum_user) != Number(challengers.maximum_user)..",Number(req.body.maximum_user) != Number(challengers.maximum_user))
                    if (Number(req.body.maximum_user) != Number(challengers.maximum_user)) {
                       
                        data.matchpricecards=[]
                    }
                    console.log("req.body.pricecard_type != challengers.pricecard_type....",req.body.pricecard_type != challengers.pricecard_type)
                    if (req.body.pricecard_type != challengers.pricecard_type) {
                       
                        data.matchpricecards=[]
                    }
                   
                    data.contest_type = req.body.contest_type;
                    data.pricecard_type = req.body.pricecard_type;
                    data.contest_cat = req.body.contest_cat;
                    data.entryfee = req.body.entryfee;
                    data.win_amount = req.body.win_amount;
                    data.contest_name=req.body.contest_name;
                    data.amount_type=req.body.amount_type;
                    let rowCollection = await matchchallengersModel.updateOne({ _id: challengers._id }, {
                        $set: data
                    });
                    if (rowCollection.modifiedCount == 1) {
                        return {
                            status: true,
                            message: 'update successfully'
                        }
                    } else {
                        return {
                            status: false,
                            message: 'can not update successfully'
                        }
                    }

                } else {
                    return {
                        status: false,
                        message: 'match challenge not found..'
                    }
                }



            }

        } catch (error) {
            throw error;
        }
    }
    async delete_customcontest(req) {
        try {
            const deletecustemcontest = await matchchallengersModel.findOne({ _id: req.params.MatchChallengerId });
            if (deletecustemcontest) {
                const deletecustemcontest = await matchchallengersModel.deleteOne({ _id: req.params.MatchChallengerId });
                console.log("///delete custem contest.///.........",deletecustemcontest)
                if (deletecustemcontest.deletedCount == 1) {
                    return {
                        status: true,
                        message: 'deleted successfully '
                    }
                } else {
                    return {
                        status: false,
                        message: 'contest not delete .. error'
                    }
                }
            } else {
                return {
                    status: false,
                    message: 'Invalid match Provided'
                }
            }

        } catch (error) {
            throw error
        }
    }
    async makeConfirmed(req) {
        try {
            const finddata = await matchchallengersModel.findOne({ _id: mongoose.Types.ObjectId(req.params.MatchChallengerId) });
            if (finddata) {
                const updateConfirmed = await matchchallengersModel.updateOne({ _id: mongoose.Types.ObjectId(req.params.MatchChallengerId) }, {
                    $set: {
                        confirmed_challenge: 1
                    }
                });
                if (updateConfirmed.modifiedCount == 1) {
                    return {
                        status: true,
                        message: 'Confirmed challenger'
                    }
                } else {
                    return {
                        status: false,
                        message: 'challenger not Confirmed '
                    }
                }
            } else {
                return {
                    status: false,
                    message: 'invalid challenger'
                }
            }

        } catch (error) {
            throw error;
        }
    }
    async addEditmatchpricecard(req) {
        try {
            if (req.params.MatchChallengerId) {
                const challengeData = await matchchallengersModel.findOne({ _id: req.params.MatchChallengerId });
                if (challengeData) {
                    const contest_Name = await contestCategoryModel.findById({ _id: challengeData.contest_cat, is_deleted: false }, { name: 1, _id: 0 });
                    if (contest_Name) {
                        let totalAmountForPercentage = 0;
                        if (challengeData.matchpricecards.length == 0) {
                            let position = 0;
                            return {
                                status: true,
                                challengeData,
                                contest_Name,
                                position,
                                totalAmountForPercentage
                            }

                        } else {
                            let lastIndexObject = (challengeData.matchpricecards.length) - 1;
                            let lastObject = challengeData.matchpricecards[lastIndexObject];
                            let position = lastObject.max_position
                            for (let key of challengeData.matchpricecards) {
                                totalAmountForPercentage = totalAmountForPercentage + key.total
                            }
                            return {
                                status: true,
                                challengeData,
                                contest_Name,
                                position,
                                check_PriceCard: challengeData.matchpricecards,
                                totalAmountForPercentage
                            }
                        }

                    } else {
                        return {
                            status: false,
                            message: 'contest not found ..'
                        }
                    }

                } else {
                    return {
                        status: false,
                        message: 'challenge data not found..'
                    }
                }
            } else {
                return {
                    status: false,
                    message: 'Invalid Match challenge Id'
                }
            }

        } catch (error) {
            throw error;
        }
    }
    async addEditPriceCard_Post(req) {
        try {
            // console.log("req.body......addEditPriceCard_Post////////////////////........", req.body)
            const challenger_Details = await matchchallengersModel.findOne({ _id: req.body.globelchallengersId });
            // console.log("challenger_Details......//", challenger_Details)
            if(Number(req.body.winners) == 0 || Number(req.body.price) == 0){
                return{
                    status:false,
                    message:'winners or price should not equal to Zero'
                }
            }
            const check_PriceCard = challenger_Details.matchpricecards;
            if (req.body.min_position && req.body.winners && req.body.price) {

                if (check_PriceCard.length == 0) {
                    if (challenger_Details.win_amount < ((Number(req.body.winners)) * (Number(req.body.price)))) {
                        // console.log("check.1.", challenger_Details.win_amount < ((Number(req.body.winners)) * (Number(req.body.price))))
                        return {
                            status: false,
                            message: 'price should be less or equal challengers winning amount'
                        }
                    } else if (challenger_Details.maximum_user < Number(req.body.winners)) {
                        return {
                            status: false,
                            message: 'number of Winner should be less or equal challengers maximum user'
                        }
                    } else {
                        // console.log("......insertPriceData........../////////////////////////////////////.")
                        let insertObj = {
                            challengersId: mongoose.Types.ObjectId(req.body.globelchallengersId),
                            winners: Number(req.body.winners),
                            price: Number(req.body.price),
                            min_position: Number(req.body.min_position),
                            max_position: (Math.abs((Number(req.body.min_position)) - (Number(req.body.winners)))),
                            total: ((Number(req.body.winners)) * (Number(req.body.price))),
                            type: 'Amount'
                        }
                        const insertAddEditPriceData = await matchchallengersModel.updateOne({ _id: req.body.globelchallengersId }, {
                            $push: { matchpricecards: insertObj }
                        })
                        // console.log("insertAddEditPriceData", insertAddEditPriceData)
                        if (insertAddEditPriceData.modifiedCount == 1) {
                            return {
                                status: true,
                                message: 'price Card added successfully'
                            };
                        } else {
                            return {
                                status: false,
                                message: 'price Card not added error..'
                            };
                        }

                    }

                } else {
                    let lastIndexObject = (check_PriceCard.length) - 1;
                    let lastObject = check_PriceCard[lastIndexObject];
                    let position = lastObject.max_position;
                    let totalAmountC = 0;
                    for await (let key of check_PriceCard) {
                        totalAmountC = totalAmountC + key.total
                    }
                    if ((totalAmountC + ((Number(req.body.price) * (Number(req.body.winners))))) > challenger_Details.win_amount) {
                        console.log("check..1", (totalAmountC + ((Number(req.body.price) * (Number(req.body.winners))))))
                        return {
                            status: false,
                            message: 'price should be less or equal to challenge winning Amount'
                        }
                    } else if (challenger_Details.maximum_user < (position + Number(req.body.winners))) {
                        console.log("check 22...0", challenger_Details.maximum_user < (position + Number(req.body.winners)))
                        return {
                            status: false,
                            message: 'number of Winner should be less or equal challengers maximum user'
                        }
                    } else {

                        let insertObj = {
                            challengersId: mongoose.Types.ObjectId(req.body.globelchallengersId),
                            winners: Number(req.body.winners),
                            price: Number(req.body.price),
                            min_position: position,
                            max_position: (Number(req.body.min_position)) + (Number(req.body.winners)),
                            total: ((Number(req.body.winners)) * (Number(req.body.price))),
                            type: 'Amount'
                        }
                        const insertAddEditPriceData = await matchchallengersModel.updateOne({ _id: req.body.globelchallengersId }, {
                            $push: { matchpricecards: insertObj }
                        })
                        if (insertAddEditPriceData.modifiedCount == 1) {
                            return {
                                status: true,
                                message: 'price Card added successfully'
                            };
                        } else {
                            return {
                                status: false,
                                message: 'price Card not added error..'
                            };
                        }

                    }

                }

            } else {
                return {
                    status: false,
                    message: 'please input the require winners && price..'
                }
            }


        } catch {
            throw error;
        }
    }
    async deleteMatchPriceCard(req) {
        try {
            console.log("req.params", req.params, "req.body", req.body, "req.query", req.query)
            const challengeData = await matchchallengersModel.findOne({ _id: req.query.challengerId });
            if (challengeData) {
                let newPriceCard = challengeData.matchpricecards
                let ObjIndex
                newPriceCard.findIndex((i, index) => {
                    if ((i._id).toString() == (req.params.id).toString()) {
                        ObjIndex = index
                    }
                })
                await newPriceCard.splice(ObjIndex, 1);
                const updatePriceCard = await matchchallengersModel.updateOne({ _id: req.query.challengerId }, {
                    $set: {
                        matchpricecards: newPriceCard
                    }
                })
                if (updatePriceCard.modifiedCount == 1) {
                    return {
                        status: true,
                        message: 'price card delete Successfully'
                    }
                } else {
                    return {
                        status: false,
                        message: 'price card not delete ..error'
                    }
                }


            } else {
                return {
                    status: false,
                    message: 'match challenge not found ..error'
                }
            }

        } catch (error) {
            throw error;
        }
    }
    async addEditPriceCardPostbyPercentage(req) {
        try {
            const challenger_Details = await matchchallengersModel.findOne({ _id: req.body.globelchallengersId });
            let check_PriceCard = challenger_Details.matchpricecards;
            if(Number(req.body.price_percent) == 0 || Number(req.body.winners) == 0 ){
                return {
                    status: false,
                    message: 'price percent or winners can not equal to Zero'
                }
            }
            if (challenger_Details) {
                let min_position = req.body.min_position;
                let winners
                let price_percent
                let price
                if (req.body.Percentage) {
                    // console.log(" i am in percentage...........................................///////////////////")
                    if (req.body.user_selection == 'number') {
                        winners = Number(req.body.winners);
                        price_percent = (Number(req.body.price_percent));
                        price = ((challenger_Details.win_amount) * ((Number(req.body.price_percent)) / 100)).toFixed(2);
                        // console.log('.......in Number.EPSILON..........', winners, price_percent, price)
                    } else {
                        winners = ((challenger_Details.maximum_user) * ((Number(req.body.winners)) / 100)).toFixed(2);
                        price_percent = (Number(req.body.price_percent));
                        price = ((challenger_Details.win_amount) * ((Number(req.body.price_percent)) / 100)).toFixed(2);
                        // console.log('.......in percentegae.EPSILON..........', winners, price_percent, price)
                    }
                } else {
                    return {
                        status: false,
                        message: 'is not Percentage'
                    }
                }
                if (min_position && winners && price_percent) {
                    if (winners <= 0) {
                        // console.log("jhbgfhjk.....winner is  ..........zero")
                        return {
                            status: false,
                            message: 'winner should not equal or less then zero'
                        }
                    }
                    // console.log("jgvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv", min_position, winners, price_percent)
                    if (min_position && winners && price_percent) {
                        if (check_PriceCard.length == 0) {
                            if (challenger_Details.win_amount < ((Number(winners)) * (Number(price)))) {
                                console.log("check..1", challenger_Details.win_amount < ((Number(winners)) * (Number(price))))
                                return {
                                    status: false,
                                    message: 'price should be less or equal challengers winning amount'
                                }
                            } else if (challenger_Details.maximum_user < Number(winners)) {
                                console.log("check..1", challenger_Details.maximum_user < Number(winners))
                                return {
                                    status: false,
                                    message: 'number of Winner should be less or equal challengers maximum user'
                                }
                            } else {
                                // console.log("......insertPriceData........../////////////////////////////////////.")
                                let insertobj = {
                                    challengersId: mongoose.Types.ObjectId(req.body.globelchallengersId),
                                    winners: Number(winners),
                                    price: Number(price),
                                    price_percent: Number(price_percent),
                                    min_position: Number(min_position),
                                    max_position: (Math.abs((Number(min_position)) - (Number(winners)))).toFixed(2),
                                    total: ((Number(winners)) * (Number(price))).toFixed(2),
                                    type: 'Amount'
                                }
                                const insertPriceData = await matchchallengersModel.updateOne({ _id: req.body.globelchallengersId }, {
                                    $push: {
                                        matchpricecards: insertobj
                                    }
                                });

                                if (insertPriceData.modifiedCount == 1) {
                                    return {
                                        status: true,
                                        message: 'price Card added successfully'
                                    };
                                } else {
                                    return {
                                        status: false,
                                        message: 'price Card not add..error..'
                                    };
                                }
                            }


                        } else {

                            let lastIndexObject = (check_PriceCard.length) - 1;
                            // console.log("lastIndexObject.........",lastIndexObject)
                            let lastObject = check_PriceCard[lastIndexObject];
                            // console.log("lastObject........",lastObject);
                            let position = lastObject.max_position

                            let totalAmountC = 0;
                            for (let key of check_PriceCard) {
                                totalAmountC = totalAmountC + key.total
                            }
                            // console.log("totalAmountCt.....", totalAmountC, Number(price), (Number(winners)), challenger_Details.win_amount)
                            // console.log("totalAmountCt.....", (totalAmountC + ((Number(price) * (Number(winners))))) > challenger_Details.win_amount)
                            // console.log(",,,,,,,,,,,,,,,,,,,,,,,,", (challenger_Details.maximum_user < (position + Number(winners))))
                            if ((totalAmountC + ((Number(price) * (Number(winners))))) > challenger_Details.win_amount) {
                                return {
                                    status: false,
                                    message: 'price should be less or equal to challengers winning Amount'
                                }
                            } else if (challenger_Details.maximum_user < (position + Number(winners))) {
                                return {
                                    status: false,
                                    message: 'number of Winner should be less or equal challengers maximum user'
                                }
                            } else {
                                console.log("iinsertsssss psotgh..percentage.. price card in number")
                                let insertObj = {
                                    challengersId: mongoose.Types.ObjectId(req.body.globelchallengersId),
                                    winners: Number(winners),
                                    price: Number(price),
                                    price_percent: Number(price_percent),
                                    min_position: position,
                                    max_position: (Number(min_position)) + (Number(winners)),
                                    total: (Number(winners)) * (Number(price)),
                                    type: 'Amount'
                                }
                                const insertPriceData = await matchchallengersModel.updateOne({ _id: req.body.globelchallengersId }, {
                                    $push: {
                                        matchpricecards: insertObj
                                    }
                                })
                                if (insertPriceData.modifiedCount == 1) {
                                    return {
                                        status: true,
                                        message: 'price Card added successfully'
                                    };
                                } else {
                                    return {
                                        status: false,
                                        message: 'price Card not add..error..'
                                    };
                                }
                            }

                        }

                    }
                } else {
                    // console.log("i am here last end")
                    return {
                        status: false,
                        message: 'please enter proper values'
                    }
                }
            } else {
                return {
                    status: false,
                    message: 'match challenge not found..'
                }
            }

        } catch (error) {
            throw error;
        }
    }
    async viewAllExportsContests(req){
        try{
            let curTime = moment().format("YYYY-MM-DD HH:mm:ss");
            // console.log("curTime.........",curTime)
            // start_date: { $gt: curTime }
            const getLunchedMatch = await listMatchesModel.find({ status: "notstarted", launch_status: "launched", }, { fantasy_type: 1, name: 1 });
            // console.log("getLunchedMatch..............",getLunchedMatch);
            let getlistofMatches
            let anArray = [];
            if (req.query.matchkey) {
                let qukey = req.query.matchkey
                // console.log("req.query.matchkey.................................", qukey)
                getlistofMatches = await matchchallengersModel.find({ matchkey: mongoose.Types.ObjectId(qukey) });
                // console.log("getlistofMatches.................................",getlistofMatches)
                for await (let keyy of getlistofMatches) {
                    let obj = {};
                    let newDate = moment(keyy.createdAt).format('MMM Do YY');
                    let day = moment(keyy.createdAt).format('dddd');
                    let time = moment(keyy.createdAt).format('h:mm:ss a');

                    obj.newDate = newDate;
                    obj.day = day;
                    obj.time = time;
                    obj._id = keyy._id;
                    obj.contest_cat = keyy.contest_cat;
                    obj.expert_name = keyy.expert_name;
                    obj.matchkey = keyy.matchkey;
                    obj.fantasy_type = keyy.fantasy_type;
                    obj.entryfee = keyy.entryfee;
                    obj.multiple_entryfee=keyy.multiple_entryfee;
                    obj.win_amount = keyy.win_amount;
                    obj.confirmed_challenge = keyy.confirmed_challenge;
                    obj.multi_entry = keyy.multi_entry;
                    obj.is_running = keyy.is_running;
                    obj.is_deleted = keyy.is_deleted;
                    obj.amount_type=keyy.amount_type;

                    anArray.push(obj)
                }

            } else {
                getlistofMatches = []
            }
            // console.log("anArray.................//////////.anArray.................", anArray)
            if (getLunchedMatch) {
                return {
                    matchData: anArray,
                    matchkey: req.body.matchkey,
                    data: getLunchedMatch,
                    status: true
                }
            } else {
                return {
                    status: false,
                    message: 'can not get list-Matches data'
                }
            }

        }catch(error){
            throw error;
        }
    }
    async addExpertContestPage(req){
        try{
            const getLunchedMatchinAddContest = await listMatchesModel.find({ status: "notstarted", launch_status: "launched" }, { fantasy_type: 1, name: 1 ,team1Id:1,team2Id:1});
            // console.log("req.query.matchkey...........",req.query.matchkey)
            let data
           if(req.query.matchkey){
                 data=await listMatchesModel.aggregate([
                    {
                        $match:{_id:mongoose.Types.ObjectId(req.query.matchkey)}
                    },
                    {
                        $lookup:{
                          from: "teams",
                          localField: "team1Id",
                          foreignField: "_id",
                          as: "team1Name"
                        }
                    },
                    {
                        $lookup:{
                            from: "teams",
                            localField: "team2Id",
                            foreignField: "_id",
                            as: "team2Name"
                          }
                    },
                    {
                        $lookup:{
                            from: "players",
                            localField: "team1Id",
                            foreignField: "team",
                            as: "team1player"
                        }
                    },
                    {
                        $lookup:{
                            from: "players",
                            localField: "team2Id",
                            foreignField: "team",
                            as: "team2player"
                          }
                    },
                    {
                        $unwind:{
                            path: "$team2Name",
                          }
                    },
                    {
                        $unwind:{
                            path: "$team1Name",
                          }
                    }]);
           }
            const getContest = await contestCategoryModel.find({}, { name: 1 });
            if (getLunchedMatchinAddContest) {
                if(req.query.matchkey){
                    return {
                        Matchdata: getLunchedMatchinAddContest,
                        contest_CatData: getContest,
                        matckeyData:data,
                        status: true
                    }
                }else{
                    return {
                        Matchdata: getLunchedMatchinAddContest,
                        contest_CatData: getContest,
                        status: true
                    }
                }
            } else {
                return {
                    status: false,
                    message: 'can not get list-Matches data'
                }
            }

        }catch(error){
            console.log(error)
        }
    }
    async getTeamNameContestExports(req){
        try{
            const data=await listMatchesModel.findOne({_id:mongoose.Types.ObjectId(req.query.matchkey)});
            const getteam1=await teamModel.findOne({_id:mongoose.Types.ObjectId(data.team1Id)});
            const getteam2=await teamModel.findOne({_id:mongoose.Types.ObjectId(data.team2Id)});
            return{
                team1:getteam2.teamName,
                team2:getteam2.teamName
            }

        }catch(error){
            console.log(error)
        }
    }
   
    async addExpertContestData(req){
        try{
            if(req.fileValidationError){
                return{
                    status:false,
                    message:req.fileValidationError
                }

            }
            // console.log("req...............add expert contest.........................body.................................",req.body);
            if(req.body.matchkey && req.body.contest_cat && req.body.expert_name && req.body.entryfee && req.body.multiple_entryfee && req.body.win_amount){
                let curTime = moment().format("YYYY-MM-DD HH:mm:ss");
                // start_date:{$gte:curTime}
                const findAllListmatch=await listMatchesModel.find({launch_status:'launched',fantasy_type:'Cricket'}).sort({start_date:-1});
                if(findAllListmatch.length >0){
                let data={};
                data.matchkey=req.body.matchkey
                data.contest_cat=req.body.contest_cat;
                data.expert_name=req.body.expert_name;
                if(req.file){
                    data.image=`/${req.body.typename}/${req.file.filename}`
                }
                data.entryfee=req.body.entryfee;
                data.multiple_entryfee=req.body.multiple_entryfee;
                data.win_amount=req.body.win_amount;
                data['status'] = 'opened';
                data['is_expert'] = 1;
                data['contest_type'] = 'Percentage';
                data['confirmed_challenge'] = 1;
                data['winning_percentage'] = 100;
                data['team1players']=req.body.team1players;
                data['team2players']=req.body.team2players;

                let is_already=await matchchallengersModel.find({matchkey:req.body.matchkey,expert_name:req.body.expert_name,entryfee:req.body.entryfee,multiple_entryfee:req.body.multiple_entryfee,win_amount:req.body.win_amount});
                if(is_already.length > 0){
                    return{
                        status:false,
                        message:'expert contest already exist..'
                    }
                }
                let allPlayer=[...req.body.team1players,...req.body.team2players];
                console.log("allPlayer..............",allPlayer);
                if(allPlayer.length < 11){
                    return{
                        status:false,
                        message:"player length must be 11"
                    }
                }
                let allcreadits=0
                for await(let key of allPlayer){
                  let findAllPlayerDetails=await matchPlayerModel.findOne({_id:mongoose.Types.ObjectId(key)});
                  if(findAllPlayerDetails){
                    allcreadits+=findAllPlayerDetails.credit
                  }
                }
                if(Number(allcreadits) > 100){
                    return{
                        status:false,
                        message:'Credit exceeded'
                    }
                }

                const insertMatchchallenge=new matchchallengersModel(data);
                const saveMatchChallenge=await insertMatchchallenge.save();

                let doc={};
                doc['userid'] = null;
                doc['matchkey'] = req.body.matchkey;
                doc['teamnumber'] = 1;
                doc['players'] = allPlayer;
                doc.vicecaptain=req.body.vicecaptain;
                doc.captain=req.body.captain;

                let expert_teamData=new JoinTeamModel(doc);
                let save_expert_teamData=await expert_teamData.save();


                let dcc={};
                dcc['expert_teamid'] = save_expert_teamData._id;

                const updateMatchChallenge=await matchchallengersModel.findOneAndUpdate({_id:insertMatchchallenge._id},{
                    $set:dcc
                },{new:true});

                return{
                    status:true,
                    message:"Expert Contest Successfully Add....."
                }
            }else{
                return{
                    status:false,
                    message:'listmatch not found...'
                }
            }
            }else{
                return{
                    status:false,
                    message:'please add required field matchkey & contest_cat & expert_name & entryfee & multiple_entryfee & win_amount'
                }
            }



            // const checkExpertName=await exportsContestModel.find({expert_name:req.body.expert_name});
            // if(checkExpertName.length > 0){
            //     return{
            //         status:false,
            //         message:'expert name already exist'
            //     }
            // }
            // let doc={};
            // doc.fantasy_type=req.body.fantasy_type;
            // doc.matchkey=req.body.matchkey;
            // doc.contest_cat=req.body.contest_cat;
            // doc.expert_name=req.body.expert_name;
            // doc.entryfee=req.body.entryfee;
            // doc.multiple_entryfee=req.body.multiple_entryfee;
            // doc.win_amount=req.body.win_amount;
            // doc.team1players=req.body.team1players;
            // doc.vicecaptain=req.body.vicecaptain;
            // doc.captain=req.body.captain;
            // doc.team2players=req.body.team2players;
            // doc.image=`/${req.body.typename}/${req.file.filename}`
            // const inertData=new exportsContestModel(doc);
            // const savedata=await inertData.save();
            // if(savedata){
            //     return{
            //         status:true,
            //         message:'expert contest add successfully'
            //     }
            // }else{
            //     return{
            //         status:false,
            //         message:'expert contest not add ..something wrong'
            //     }
            // }

        }catch(error){
            console.log(error);
        }
    }
    async editExpertContest(req){
        try{

            let realData = await matchchallengersModel.findOne({_id:req.params.id});


            let expert_teamid ='';



            if( realData.expert_teamid) {
                expert_teamid = realData.expert_teamid;
              }

              let expert_team=await JoinTeamModel.findOne({_id:expert_teamid});
              console.log("expert_team----------------------",expert_team);
              if(expert_team){
                  realData.expert_team=expert_team
              }
            //   console.log("..................................//expert_team.expert_team............",expert_team.captain)
            //   console.log("..................................//expert_team.vicecaptain............",expert_team.vicecaptain)
              let captain=expert_team.captain;
              let vicecaptain=expert_team.vicecaptain;
            //   console.log("....challenge...............................",challenge)
            //   console.log("...req.query.matchkey.........................",req.query.matchkey)
              let matckeyData =await listMatchesModel.aggregate([
                {
                    $match:{_id:mongoose.Types.ObjectId(req.query.matchkey)}
                },
                {
                    $lookup:{
                      from: "teams",
                      localField: "team1Id",
                      foreignField: "_id",
                      as: "team1Name"
                    }
                },
                {
                    $lookup:{
                        from: "teams",
                        localField: "team2Id",
                        foreignField: "_id",
                        as: "team2Name"
                      }
                },
                {
                    $lookup:{
                        from: "players",
                        localField: "team1Id",
                        foreignField: "team",
                        as: "team1player"
                    }
                },
                {
                    $lookup:{
                        from: "players",
                        localField: "team2Id",
                        foreignField: "team",
                        as: "team2player"
                      }
                },
                {
                    $unwind:{
                        path: "$team2Name",
                      }
                },
                {
                    $unwind:{
                        path: "$team1Name",
                      }
                }]);

                // console.log("...........matckeyData[0].team1player..............",matckeyData[0].team1player);
                let batsman1 = 0
                let batsman2 = 0
                let bowlers1 = 0
                let bowlers2 = 0
                let allrounder1 = 0
                let allrounder2 = 0
                let wk1 = 0
                let wk2 = 0
                let criteria = 0
                // console.log("matckeyData[0].team1player.length....//.........",realData. team1players.length)
                for await(let key of realData. team1players){
                    // console.log("key.........",key)
                    let getRole=await matchPlayerModel.findOne({playerid:key},{credit:1,role:1});
                    // console.log("getRole.....",getRole.role)
                    if(getRole.role == 'batsman'){
                        batsman1 ++;
                    }
                    if(getRole.role == 'bowler'){
                        bowlers1++;
                    }
                    if(getRole.role == 'keeper'){
                        wk1++;
                    }
                    if(getRole.role == 'allrounder'){
                        allrounder1++
                    }
                    criteria += getRole.credit
                }
                console.log("realData.team2player.length......//.......",realData.team2players.length)
                for await(let key of realData.team2players){
                    let getRole=await matchPlayerModel.findOne({playerid:key},{credit:1,role:1});
                    if(getRole.role == 'batsman'){
                        batsman2 ++;
                    }
                    if(getRole.role == 'bowler'){
                        bowlers2++;
                    }
                    if(getRole.role == 'keeper'){
                        wk2++;
                    }
                    if(getRole.role == 'allrounder'){
                        allrounder2++
                    }
                    criteria += getRole.credit
                }
                
            // let realData=await exportsContestModel.findOne({_id:mongoose.Types.ObjectId(req.params.id),matchkey:mongoose.Types.ObjectId(req.query.matchkey)});
            const getContest = await contestCategoryModel.find({}, { name: 1 });
                    
                return{
                    status:true,
                    realData:realData,
                    matckeyData:matckeyData,
                    contest_CatData: getContest,
                    batsman1:batsman1,
                    batsman2:batsman2,
                    bowlers1:bowlers1,
                    bowlers2:bowlers2,
                    allrounder1:allrounder1,
                    allrounder2:allrounder2,
                    wk2:wk2,
                    wk1:wk1,
                    criteria:criteria,
                    vicecaptain:vicecaptain,
                    captain:captain
                }
        }catch(error){
            console.log(error)
        }
    }
    async editExpertContestData(req){
        try{
            if(req.fileValidationError){
                return{
                    status:false,
                    message:req.fileValidationError
                }

            }
            const matchchallenge=await matchchallengersModel.findOne({_id:mongoose.Types.ObjectId(req.params.id)});
            console.log("........///////////............................",req.body)
            const findjoinedleauges=await JoinLeaugeModel.findOne({challengeid:mongoose.Types.ObjectId(req.params.id)});
            if(findjoinedleauges){
                return{
                    status:false,
                    message:'You cannot edit this challenge now!'
                }
            }
            let is_already_exists=await matchchallengersModel.find({
                _id:{$ne:mongoose.Types.ObjectId(req.params.id)},
                    matchkey:req.body.matchkey,
                expert_name:req.body.expert_name,
                entryfee:req.body.entryfee,
                multiple_entryfee:req.body.multiple_entryfee,
                win_amount:req.body.win_amount
            })
            console.log("is_already_exists.......................................",is_already_exists)
            if(is_already_exists.length > 0){
                return{
                    status:false,
                    message:'An expert contest with these details already exists '
                }
            }
            let data={};
            data.matchkey=req.body.matchkey;
            data.contest_cat=req.body.contest_cat;
            data.expert_name=req.body.expert_name;
            if(req.file){
                let filePath=`public${matchchallenge.image}`
                if(fs.existsSync(filePath)){
                    fs.unlinkSync(filePath);
                }
                data.image=`/${req.body.typename}/${req.file.filename}`
            }
            data['entryfee'] = req.body.entryfee;
            data['multiple_entryfee'] = req.body.multiple_entryfee;
            data['win_amount'] = req.body.win_amount;
            data['status'] = 'opened';
            data['is_expert'] = 1;
            data['contest_type'] = 'Percentage';
            data['confirmed_challenge'] = 1;
            data['winning_percentage'] = 100;
            data['team1players']=req.body.team1players;
            data['team2players']=req.body.team2players;

            let allPlayer=[...req.body.team1players,...req.body.team2players];
            console.log("allPlayer..............",allPlayer);
            if(allPlayer.length < 11){
                return{
                    status:false,
                    message:`player length is ${allPlayer.length} ,must be 11`
                }
            }
            let allcreadits=0
            for await(let key of allPlayer){
              let findAllPlayerDetails=await matchPlayerModel.findOne({_id:mongoose.Types.ObjectId(key)});
              if(findAllPlayerDetails){
                allcreadits+=findAllPlayerDetails.credit
              }
            }
            if(Number(allcreadits) > 100){
                return{
                    status:false,
                    message:`Credit exceeded ${allcreadits}`
                }
            }
            const updateExpertContest=await matchchallengersModel.findOneAndUpdate({_id:mongoose.Types.ObjectId(req.params.id)},data);


                 let doc={};
                doc['userid'] = null;
                doc['matchkey'] = req.body.matchkey;
                doc['teamnumber'] = 1;
                doc['players'] = allPlayer;
                doc.vicecaptain=req.body.vicecaptain;
                doc.captain=req.body.captain;

                const updateJoinTeam=await JoinTeamModel.findOneAndUpdate({_id:matchchallenge.expert_teamid},doc,{new:true});

                return{
                            status:true,
                            message:"Expert Contest Successfully Update....."
                      }


// --------------------------------------old----------------------------------------
            // let challenge = await matchchallengersModel.findOne({_id:mongoose.Types.ObjectId(req.params.id)})
            // if(challenge){
            //     let findjoinedleauges =await JoinLeaugeModel.find({challengeid:mongoose.Types.ObjectId(challenge._id)});
            //     if(findjoinedleauges.length == 0){
            //         return{
            //             status:false,
            //             message:'You cannot edit this challenge now!'
            //         }
            //     }
            //     data['matchkey'] = req.body.matchkey
            //     data['contest_cat'] = req.body.contest_cat;
            //     data['expert_name'] = req.body.expert_name;
            //     data['entryfee'] = req.body.entryfee;
            //     data['multiple_entryfee'] =req.body.multiple_entryfee;
            //     data['win_amount'] = req.body.win_amount;
            //     data['status'] = 'opened';
            //     data['is_expert'] = 1;
            //     data['contest_type'] = 'Percentage';
            //     data['confirmed_challenge'] = 1;
            //     data['winning_percentage'] = 100;

            //     let is_already=await matchchallengersModel.find({_id:{$ne:mongoose.Types.ObjectId(req.params.id)},matchkey:req.body.matchkey,expert_name:req.body.expert_name,entryfee:req.body.entryfee,win_amount:req.body.win_amount,multiple_entryfee:req.body.multiple_entryfee});
            //     if(is_already){
            //         return{
            //             status:false,
            //             message:'contest expert already exists with same credentials'
            //         }
            //     }
                
            //     const updateMatchData=await matchchallengersModel.findOneAndUpdate({_id:mongoose.Types.ObjectId(req.params.id)},data);
        

            //     let allPlayer=[...req.body.team1players,...req.body.team2players];
            //     // console.log("allPlayer..............",allPlayer);
            //     if(allPlayer.length < 11){
            //         return{
            //             status:false,
            //             message:"player leangth must be 11"
            //         }
            //     }
            //     let allcreadits=0
            //     for await(let key of allPlayer){
            //       let findAllPlayerDetails=await matchPlayerModel.findOne({_id:mongoose.Types.ObjectId(key)});
            //       if(findAllPlayerDetails){
            //         allcreadits+=findAllPlayerDetails.credit
            //       }
            //     }
            //     if(Number(allcreadits) > 100){
            //         return{
            //             status:false,
            //             message:'Credit exceeded'
            //         }
            //     }
        
        
            //     let data = {};
            //     data['userid'] = null;
            //     data['matchkey'] =req.body.matchkey;
            //     data['teamnumber'] = 1;
            //     data['players'] = allPlayer;
            //     data['captain'] = req.body.captain;
            //     data['vicecaptain'] = req.body.vicecaptain;
                
            //     let expert_teamData=new JoinTeamModel(doc);
            //     let save_expert_teamData=await expert_teamData.save();


            //     let dcc={};
            //     dcc['expert_teamid'] = save_expert_teamData._id;

            //     const updateMatchChallenge=await matchchallengersModel.findOneAndUpdate({_id:insertMatchchallenge._id},{
            //         $set:dcc
            //     },{new:true});

            //     return{
            //         status:true,
            //         message:"Expert Contest Successfully Update....."
            //     }
        
            //  }else{
            //     return{
            //         status:false,
            //         message:'match not found something wrong....'
            //     }
            //   }

        }catch(error){
            console.log(error)
        }
    }
}
module.exports = new challengersService();