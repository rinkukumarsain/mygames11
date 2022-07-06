const mongoose = require('mongoose');
const moment = require('moment');

const constant = require('../../config/const_credential');

const listMatches = require('../../models/listMatchesModel');
const matchPlayers = require('../../models/matchPlayersModel')
const resultMatch = require('../../models/resultMatchModel')
const resultPoint = require('../../models/resultPointModel')
const matchChallenge = require('../../models/matchChallengersModel')
const joinTeam = require('../../models/JoinTeamModel')
const joinLeague = require('../../models/JoinLeaugeModel')
const matchRuns = require('../../models/matchRunModel')
const refundMatch = require('../../models/refundModel')
const entityApiController = require('../controller/entityApiController');
const matchServices = require('./matchServices');
const TransactionModel = require('../../models/transactionModel');
const userModel = require('../../models/userModel');
const finalResultModel = require('../../models/finalResultModel');
const tdsDetailModel = require('../../models/tdsDetailModel');
const fs = require('fs');
class resultServices {
    constructor() {
        return {
            showPlaying: this.showPlaying.bind(this),
            updateResultMatches: this.updateResultMatches.bind(this),
            findMatchPlayers: this.findMatchPlayers.bind(this),
            refundAmount: this.refundAmount.bind(this),
            allRefundAmount: this.allRefundAmount.bind(this),
            distributeWinningAmount: this.distributeWinningAmount.bind(this)
        }
    }


    async findMatchPlayers(matchid, players_key = null, play11 = null) {
        let pipeline = [];

        pipeline.push({
            $match: { matchkey: mongoose.Types.ObjectId(matchid) }
        })

        pipeline.push({
            $lookup: {
                from: 'players',
                localField: 'playerid',
                foreignField: '_id',
                as: 'playersData'
            }
        })
        if (players_key && players_key != null) {
            pipeline.push({
                $match: {
                    "playersData.players_key": players_key
                }
            })
        }

        if (play11 && play11 != null) {
            pipeline.push({
                $match: {
                    "playingstatus": 1
                }
            })
        }
        pipeline.push({
            $unwind: { path: "$playersData" }
        })
        let result = await matchPlayers.aggregate(pipeline);
        return result;
    }
    async showPlaying(real_matchkey, matchkey) {
        try {
            const checkmatch = await listMatches.findOne({ _id: matchkey });
            const role = {
                'bowl': 'bowler',
                'bat': 'batsman',
                'all': 'allrounder',
                'wk': 'keeper',
                'wkbat': 'keeper',
                'cap': 'allrounder',
                'squad': 'allrounder',
            }
            let teamaplayingxi = [];
            let teambplayingxi = [];
            let newplayingxi = [];

            if (checkmatch) {

                let checkstarted = checkmatch.status;
                const giveresresult = await entityApiController.getMatchPlayers(real_matchkey);
                // const giveresresult = fs.readFileSync('squads.json', 'utf8');
                if (giveresresult) {
                    // console.log(JSON.stringify(giveresresult));
                    // const giveresresultNew = JSON.parse(giveresresult);  //with entity url remove this line
                    let responseresult = giveresresult.response;
                    // ------------------- team a ---------------------
                    if (responseresult.teama.squads) {
                        let teamasquads = responseresult.teama.squads;
                        let teamkey = responseresult.teama.team_id;
                        // console.log(teamkey);
                        teamasquads.forEach(async index => {
                            if (index.playing11 == 'true') {
                                teamaplayingxi.push(index.player_id);
                                let matchplayersid = await this.findMatchPlayers(checkmatch._id, index.player_id);
                                if (matchplayersid[0]) {
                                    const playing11status = 1;
                                    const updatedMatchPlayer = await matchPlayers.findOneAndUpdate({ '_id': matchplayersid[0] }, { playingstatus: playing11status }, { new: true });
                                }
                                // console.log('Team A -----. ', teama);
                            }
                        })
                    }
                    // ------------------ team b -----------------
                    if (responseresult.teamb.squads) {
                        let teambsquads = responseresult.teamb.squads;
                        let teamb = [];
                        let teamkey = responseresult.teamb.team_id;
                        teambsquads.forEach(async index => {
                            if (index.playing11 == 'true') {
                                teambplayingxi.push(index.player_id)
                                let matchplayersid = await this.findMatchPlayers(checkmatch._id, index.player_id);
                                if (matchplayersid[0]) {
                                    const playing11status = 1;
                                    const updatedMatchPlayer = await matchPlayers.findOneAndUpdate({ '_id': matchplayersid[0] }, { playingstatus: playing11status }, { new: true });
                                }
                            }
                        })
                    }
                }
            }
            if (teamaplayingxi.length > 0 && teambplayingxi.length > 0) {
                let newplayingXi = [...teamaplayingxi, ...teambplayingxi];
                let allMatchPlayers = await this.findMatchPlayers(checkmatch._id);
                for (let player of allMatchPlayers) {
                    let playing11status = newplayingXi.includes(player.playersData.players_key) ? 1 : 0;
                    await matchPlayers.findOneAndUpdate({ '_id': player }, { playingstatus: playing11status }, { new: true });
                }
            }

            if (teamaplayingxi.length > 0 || teambplayingxi.length > 0) {
                let playing11_status = 1;
                await listMatches.findOneAndUpdate({ '_id': checkmatch }, { playing11_status: playing11_status }, { new: true });
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async updateResultMatches(req) {
            try {
                const currentDate = moment().subtract(2, 'days').format('YYYY-MM-DD 00:00:00');
                console.log('Current Date -------. ', currentDate);
                const listmatches = await listMatches.find({
                    fantasy_type: "Cricket",
                    start_date: { $gte: currentDate },
                    launch_status: 'launched',
                    final_status: { $ne: 'winnerdeclared' },
                    status: { $ne: 'completed' }
                })
                if (listmatches.length > 0) {
                    for (let index of listmatches) {
                        let matchType = index.format;
                        let matchTimings = index.start_date;
                        let matchTimings1 = moment(matchTimings).subtract(59, 'm').format('YYYY-MM-DD HH:mm:ss');
                        let real_matchkey = index.real_matchkey;
                        let matchkey = index._id;
                        const currentDate1 = moment().format('YYYY-MM-DD HH:mm:ss');
                        if (currentDate1 > matchTimings1 && currentDate1 < matchTimings) {
                            this.showPlaying(real_matchkey, matchkey);
                        }
                        if (currentDate1 >= matchTimings) {
                            this.getScoresUpdates(real_matchkey, matchkey);
                        }
                    }
                    return listmatches
                }

            } catch (error) {
                console.log('error', error);
                throw error;
            }
        }
        /**
         * @function getScoresUpdates
         * @description Score update Of A Match
         * @param { matchkey }
         * @author Rinku Sain
         */
    async getScoresUpdates(real_matchkey, matchkey) {
        try {
            let m_status = {
                1: constant.MATCHES_STATUS.NOT_STARTED,
                2: constant.MATCHES_STATUS.COMPLETED,
                3: constant.MATCHES_STATUS.STARTED,
                4: constant.MATCHES_STATUS.COMPLETED
            };
            const checkmatch = await listMatches.findOne({ _id: matchkey });
            if (checkmatch) {
                let teamainnKey = [];
                let teambinnKey = [];
                const giveresresultNew = await entityApiController.getMatchScore(real_matchkey);
                // const giveresresult1 = fs.readFileSync('scorecard.json', 'utf8');
                if (giveresresultNew) {
                    // const giveresresultNew = JSON.parse(giveresresult1);  //with entity url remove this line
                    let giveresresult = giveresresultNew.response;
                    if (giveresresult) {
                        let matchdata = {};
                        const getMatchRuns = await matchRuns.findOne({ matchkey: mongoose.Types.ObjectId(matchkey) });
                        if (getMatchRuns) {
                            matchdata.matchkey = matchkey;
                            matchdata.teams1 = giveresresult.teama.short_name;
                            matchdata.teams2 = giveresresult.teamb.short_name;
                            matchdata.winning_status = (giveresresult.result) ? giveresresult.result : 0;
                            if (giveresresult.innings) {
                                // console.log('giveresresult.innings', giveresresult.innings);
                                if (giveresresult.innings.length > 2) {
                                    for (let [i, value] of giveresresult.innings) {
                                        if (value.batting_team_id == giveresresult.teama.team_id) {
                                            teamainnKey.push(giveresresult.innings[i]);
                                        } else if (value.batting_team_id == giveresresult.teamb.team_id) {
                                            teambinnKey.push(giveresresult.innings[i]);
                                        }
                                    }
                                } else {
                                    let key1 = giveresresult.innings.findIndex(element => element.batting_team_id == giveresresult.teama.team_id);
                                    let key2 = giveresresult.innings.findIndex(element => element.batting_team_id == giveresresult.teamb.team_id);
                                    if (key1 >= 0) {
                                        teamainnKey.push(giveresresult.innings[key1]);
                                    }
                                    if (key2 >= 0) {
                                        teambinnKey.push(giveresresult.innings[key2]);
                                    }
                                }
                                let gettestscore1 = 0;
                                let gettestscore2 = 0;
                                let gettestwicket1 = 0;
                                let gettestwicket2 = 0;
                                let gettestover1 = 0;
                                let gettestover2 = 0;
                                if (teambinnKey[1] && teambinnKey[1]) {
                                    gettestscore2 = (teambinnKey[1]) ? teambinnKey[1].equations.runs : 0;
                                    gettestscore1 = (teamainnKey[1]) ? teamainnKey[1].equations.runs : 0;
                                    gettestwicket1 = (teamainnKey[1]) ? teamainnKey[1].equations.wickets : 0;
                                    gettestwicket2 = (teambinnKey[1]) ? teambinnKey[1].equations.wickets : 0;
                                    gettestover1 = (teamainnKey[1]) ? teamainnKey[1].equations.overs : 0;
                                    gettestover2 = (teambinnKey[1]) ? teambinnKey[1].equations.overs : 0;
                                }
                                if (!gettestwicket1) {
                                    matchdata.wickets1 = (teamainnKey[0]) ? teamainnKey[0].equations.wickets : 0;
                                } else {
                                    matchdata.wickets1 = ((teamainnKey[0]) ? teamainnKey[0].equations.wickets : 0) + ',' + gettestwicket1;
                                }
                                if (!gettestwicket2) {
                                    matchdata.wickets2 = (teambinnKey[0]) ? teambinnKey[0].equations.wickets : 0;
                                } else {
                                    matchdata.wickets2 = ((teambinnKey[0]) ? teambinnKey[0].equations.wickets : 0) + ',' + gettestwicket2;
                                }
                                if (!gettestover1) {
                                    matchdata.overs1 = (teamainnKey[0]) ? teamainnKey[0].equations.overs : 0;
                                } else {
                                    matchdata.overs1 = ((teamainnKey[0]) ? teamainnKey[0].equations.overs : 0) + ',' + gettestover1;
                                }
                                if (!gettestover2) {
                                    matchdata.overs2 = (teambinnKey[0]) ? teambinnKey[0].equations.overs : 0;
                                } else {
                                    matchdata.overs2 = ((teambinnKey[0]) ? teambinnKey[0].equations.overs : 0) + ',' + gettestover2;
                                }
                                if (!gettestscore1) {
                                    matchdata.runs1 = (teamainnKey[0]) ? teamainnKey[0].equations.runs : 0;
                                } else {
                                    matchdata.runs1 = ((teamainnKey[0]) ? teamainnKey[0].equations.runs : 0) + ',' + gettestscore1;
                                }
                                if (!gettestscore2) {
                                    matchdata.runs2 = (teambinnKey[0]) ? teambinnKey[0].equations.runs : 0;
                                } else {
                                    matchdata.runs2 = ((teambinnKey[0]) ? teambinnKey[0].equations.runs : 0) + ',' + gettestscore2;
                                }
                            } else {
                                matchdata.winning_status = 0;
                                matchdata.wickets1 = 0;
                                matchdata.wickets2 = 0;
                                matchdata.overs1 = 0;
                                matchdata.overs2 = 0;
                                matchdata.runs1 = 0;
                                matchdata.runs2 = 0;
                            }
                            await matchRuns.updateOne({ '_id': mongoose.Types.ObjectId(getMatchRuns._id) }, {
                                $set: matchdata
                            });
                        } else {
                            matchdata.matchkey = matchkey;
                            matchdata.teams1 = giveresresult.teama.short_name;
                            matchdata.teams2 = giveresresult.teamb.short_name;
                            matchdata.winning_status = (giveresresult.result) ? giveresresult.result : 0;
                            if (giveresresult.innings) {
                                // console.log('giveresresult.innings', giveresresult.innings);
                                if (giveresresult.innings.length > 2) {
                                    for (let [i, value] of giveresresult.innings) {
                                        if (value.batting_team_id == giveresresult.teama.team_id) {
                                            teamainnKey.push(giveresresult.innings[i]);
                                        } else if (value.batting_team_id == giveresresult.teamb.team_id) {
                                            teambinnKey.push(giveresresult.innings[i]);
                                        }
                                    }
                                } else {
                                    let key1 = giveresresult.innings.findIndex(element => element.batting_team_id == giveresresult.teama.team_id);
                                    let key2 = giveresresult.innings.findIndex(element => element.batting_team_id == giveresresult.teamb.team_id);
                                    if (key1 >= 0) {
                                        teamainnKey.push(giveresresult.innings[key1]);
                                    }
                                    if (key2 >= 0) {
                                        teambinnKey.push(giveresresult.innings[key2]);
                                    }
                                }
                                let gettestscore1 = 0;
                                let gettestscore2 = 0;
                                let gettestwicket1 = 0;
                                let gettestwicket2 = 0;
                                let gettestover1 = 0;
                                let gettestover2 = 0;
                                if (teambinnKey[1] && teambinnKey[1]) {
                                    gettestscore2 = (teambinnKey[1]) ? teambinnKey[1].equations.runs : 0;
                                    gettestscore1 = (teamainnKey[1]) ? teamainnKey[1].equations.runs : 0;
                                    gettestwicket1 = (teamainnKey[1]) ? teamainnKey[1].equations.wickets : 0;
                                    gettestwicket2 = (teambinnKey[1]) ? teambinnKey[1].equations.wickets : 0;
                                    gettestover1 = (teamainnKey[1]) ? teamainnKey[1].equations.overs : 0;
                                    gettestover2 = (teambinnKey[1]) ? teambinnKey[1].equations.overs : 0;
                                }
                                if (!gettestwicket1) {
                                    matchdata.wickets1 = (teamainnKey[0]) ? teamainnKey[0].equations.wickets : 0;
                                } else {
                                    matchdata.wickets1 = ((teamainnKey[0]) ? teamainnKey[0].equations.wickets : 0) + ',' + gettestwicket1;
                                }
                                if (!gettestwicket2) {
                                    matchdata.wickets2 = (teambinnKey[0]) ? teambinnKey[0].equations.wickets : 0;
                                } else {
                                    matchdata.wickets2 = ((teambinnKey[0]) ? teambinnKey[0].equations.wickets : 0) + ',' + gettestwicket2;
                                }
                                if (!gettestover1) {
                                    matchdata.overs1 = (teamainnKey[0]) ? teamainnKey[0].equations.overs : 0;
                                } else {
                                    matchdata.overs1 = ((teamainnKey[0]) ? teamainnKey[0].equations.overs : 0) + ',' + gettestover1;
                                }
                                if (!gettestover2) {
                                    matchdata.overs2 = (teambinnKey[0]) ? teambinnKey[0].equations.overs : 0;
                                } else {
                                    matchdata.overs2 = ((teambinnKey[0]) ? teambinnKey[0].equations.overs : 0) + ',' + gettestover2;
                                }
                                if (!gettestscore1) {
                                    matchdata.runs1 = (teamainnKey[0]) ? teamainnKey[0].equations.runs : 0;
                                } else {
                                    matchdata.runs1 = ((teamainnKey[0]) ? teamainnKey[0].equations.runs : 0) + ',' + gettestscore1;
                                }
                                if (!gettestscore2) {
                                    matchdata.runs2 = (teambinnKey[0]) ? teambinnKey[0].equations.runs : 0;
                                } else {
                                    matchdata.runs2 = ((teambinnKey[0]) ? teambinnKey[0].equations.runs : 0) + ',' + gettestscore2;
                                }
                            } else {
                                matchdata.winning_status = 0;
                                matchdata.wickets1 = 0;
                                matchdata.wickets2 = 0;
                                matchdata.overs1 = 0;
                                matchdata.overs2 = 0;
                                matchdata.runs1 = 0;
                                matchdata.runs2 = 0;
                            }
                            await matchRuns.create(matchdata);
                        }
                        let matchStatus = {};
                        let mainArrayGet = giveresresult;
                        matchStatus.status = m_status[mainArrayGet.status];
                        if (matchStatus.status == constant.MATCHES_STATUS.COMPLETED && checkmatch.final_status == constant.MATCH_FINAL_STATUS.PENDING) {
                            matchStatus.final_status = constant.MATCH_FINAL_STATUS.IS_REVIEWED
                        }
                        await listMatches.updateOne({ '_id': mongoose.Types.ObjectId(checkmatch._id) }, {
                            $set: matchStatus
                        });
                        let playing11 = await this.findMatchPlayers(checkmatch._id, null, 1);
                        // console.log('matchplayers-----',matchPlayers);
                        if (mainArrayGet.players.length > 0) {
                            let matchPlayersData = await this.findMatchPlayers(checkmatch._id);
                            if (matchPlayers.length > 0) {
                                let innplayers = [],
                                    t = '',
                                    f = 1,
                                    j = 1;
                                for (let player of matchPlayersData) {

                                    let pid = player.playerid;
                                    let value = player.playersData.players_key;
                                    let i = 1;
                                    innplayers[value] = [];
                                    innplayers[value][i] = {};
                                    for (let [ak, teama] of teamainnKey.entries()) {
                                        let datasv = {},
                                            runs = 0,
                                            fours = 0,
                                            six = 0,
                                            duck = 0,
                                            maiden_over = 0,
                                            wicket = 0,
                                            pCatch = 0,
                                            runouts = 0,
                                            stumbed = 0,
                                            batdots = 0,
                                            balldots = 0,
                                            miletone_run = 0,
                                            bball = 0,
                                            grun = 0,
                                            balls = 0,
                                            bballs = 0,
                                            extra = 0,
                                            overs = 0;

                                        let bat = (teama.batsmen) ? teama.batsmen.findIndex(element => element.batsman_id == value) : "";
                                        if (bat != -1) {

                                            innplayers[value][i]['batting'] = teama.batsmen[bat];
                                        } else {
                                            if (!innplayers[value][i]['batting']) {
                                                innplayers[value][i]['batting'] = [];
                                            }
                                            let bowl = (teama.bowlers) ? teama.bowlers.findIndex(element => element.bowler_id == value) : "";
                                            let field = (teama.fielder) ? teama.fielder.findIndex(element => element.fielder_id == value) : "";
                                            innplayers[value][i]['bowling'] = (bowl != '') ? teama.bowlers[bowl] : [];
                                            innplayers[value][i]['fielding'] = (field != '') ? teama.fielder[field] : [];
                                        }

                                        let batb = (teambinnKey[ak]['batsmen']) ? teambinnKey[ak]['batsmen'].findIndex(element => element.batsman_id == value) : "";

                                        if (batb != -1) {
                                            innplayers[value][i]['batting'] = teambinnKey[ak]['batsmen'][batb];

                                        } else {
                                            if (!innplayers[value][i]['batting']) {
                                                innplayers[value][i]['batting'] = [];
                                            }
                                            if (!innplayers[value][i]['bowling']) {
                                                let bowlb = (teambinnKey[ak]['bowlers']) ? teambinnKey[ak]['bowlers'].findIndex(element => element.bowler_id == value) : "";
                                                innplayers[value][i]['bowling'] = teambinnKey[ak]['bowlers'][bowlb];
                                            }
                                            if (!innplayers[value][i]['fielding']) {
                                                let fieldb = (teambinnKey[ak]['fielder']) ? teambinnKey[ak]['fielder'].findIndex(element => element.fielder_id == value) : "";
                                                innplayers[value][i]['fielding'] = teambinnKey[ak]['fielder'][fieldb];
                                            }
                                        }
                                        let play = innplayers[value][i];
                                        if (play['batting'] || play['bowling'] || play['fielding']) {
                                            let checkPlaying11 = playing11.find(element => element.playersData.players_key == value);
                                            if (checkPlaying11) {
                                                datasv.starting11 = 1;
                                            }
                                            //batting points
                                            if (play['batting']) {
                                                if (play['batting']['strike_rate']) {
                                                    datasv.batting = 1;
                                                    datasv.strike_rate = play['batting']['strike_rate'];
                                                } else {
                                                    datasv.batting = 0;
                                                }
                                                /* runs points */
                                                if (play['batting']['runs']) {
                                                    datasv.runs = runs = runs + play['batting']['runs'];
                                                } else {
                                                    datasv.runs = 0;
                                                }
                                                /* fours points */

                                                if (play['batting']['fours']) {
                                                    datasv.fours = fours = fours + play['batting']['fours'];
                                                }
                                                if (play['batting']['balls_faced']) {
                                                    datasv.bball = bball = bball + play['batting']['balls_faced'];
                                                }
                                                /* sixes Points */

                                                if (play['batting']['sixes']) {
                                                    datasv.six = six = six + play['batting']['sixes'];
                                                }
                                                if (play['batting']['dismissal']) {

                                                    if (player.playersData.role != 'bowler') {
                                                        if ((runs == 0) && (play['batting']['dismissal'] != '')) {
                                                            datasv.duck = duck = 1;
                                                        } else {
                                                            datasv.duck = duck = 0;
                                                        }
                                                    } else {
                                                        datasv.duck = duck = 0;
                                                    }
                                                    if (play['batting']['dismissal'] != '') {
                                                        datasv.out_str = play['batting']['how_out'];
                                                    } else {
                                                        datasv.out_str = 'not out';
                                                    }
                                                }
                                                if (play['batting']['dots']) {
                                                    datasv.battingdots = batdots = batdots + play['batting']['run0'];
                                                }

                                                if (play['batting']['dismissal'] == 'lbw' || play['batting']['dismissal'] == 'bowled') {
                                                    let wbowlerkey = play['batting']['bowler_id'];
                                                    // console.log('wbowlerkey',wbowlerkey);
                                                    let bowlerplayersid = await this.findMatchPlayers(checkmatch._id, wbowlerkey);
                                                    // console.log('bowlerplayersid',bowlerplayersid[0]);
                                                    if (bowlerplayersid[0]) {
                                                        datasv.wplayerid = bowlerplayersid[0].playerid;
                                                    }
                                                }
                                                datasv['wicket_type'] = (play['batting']['dismissal']) ? play['batting']['dismissal'] : '';
                                            }
                                            //Bowling points
                                            if (play['bowling']) {
                                                let bowling = play['bowling'];
                                                datasv.bowling = 1;
                                                datasv.economy_rate = bowling['econ'];
                                                datasv.maiden_over = maiden_over = maiden_over + (bowling['maidens'] ? bowling['maidens'] : 0);
                                                datasv.wicket = wicket = wicket + (bowling['wickets'] ? bowling['wickets'] : 0);
                                                datasv.overs = overs = overs + (bowling['overs'] ? bowling['overs'] : 0);
                                                datasv.grun = grun = grun + (bowling['runs_conceded'] ? bowling['runs_conceded'] : 0);
                                                datasv.balldots = balldots = balldots + (bowling['run0'] ? bowling['run0'] : 0);
                                                datasv.balls = balls = balls + (overs ? overs * 6 : 0);
                                                if (bowling['noballs']) {
                                                    datasv.extra = extra = extra + (bowling['noballs'] + bowling['wides']);
                                                }

                                            }
                                            // console.log('dsfsdffffffffffffffffffff',play['fielding']);
                                            // fielding points //
                                            if (play['fielding']) {
                                                let fielding = play['fielding'];
                                                datasv.catch = pCatch = pCatch + (fielding['catches']) ? fielding['catches'] : 0;
                                                if (fielding['runout_direct_hit'] == 0) {
                                                    datasv.hitter = fielding['runout_catcher'];
                                                    datasv.thrower = fielding['runout_thrower'];
                                                } else {
                                                    datasv.thrower = 1;
                                                    datasv.hitter = 1;
                                                }
                                                datasv.stumbed = stumbed = stumbed + (fielding['stumping'] ? fielding['stumping'] : 0);
                                            }

                                            datasv.matchkey = mongoose.Types.ObjectId(checkmatch._id);
                                            datasv.player_key = value;
                                            datasv.player_id = pid;
                                            datasv.innings = i;
                                            // console.log('data result ---------------',datasv);
                                            let findResult = await resultMatch.findOne({ matchkey: mongoose.Types.ObjectId(checkmatch._id), player_key: value, innings: i });
                                            if (findResult) {
                                                await resultMatch.updateOne({ _id: mongoose.Types.ObjectId(findResult._id) }, {
                                                    $set: datasv
                                                });
                                            } else {
                                                await resultMatch.create(datasv);
                                            }
                                        }
                                        i++;
                                    }
                                }
                                let matchPlayers = await this.playerPoint(checkmatch._id, checkmatch.format);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    async playerPoint(matchid, format) {
        let findResultMatches = await resultMatch.find({ matchkey: mongoose.Types.ObjectId(matchid) });
        if (findResultMatches.length > 0) {
            for (let row of findResultMatches) {
                let resultmatchupdate = [],
                    result = {},
                    resultpoints = {};
                let duck = row.duck,
                    player_key = row.player_key,
                    runs = row.runs,
                    wicket = row.wicket,
                    pCatch = row.catch,
                    stumbed = row.stumbed,
                    boundary = row.boundary,
                    six = row.six,
                    fours = row.fours,
                    maiden_over = row.maiden_over,
                    thrower = row.thrower,
                    hitter = row.hitter,
                    overs = row.overs,
                    bballs = row.bball,
                    erate = row.economy_rate,
                    strikerate = row.strike_rate,
                    extra_points = row.extra_points,
                    wicket_type = row.wicket_type,
                    wplayerid = row.wplayerid,
                    startingpoint = 0,
                    throwpoint = 0,
                    hittspoints = 0,
                    duckpoint = 0,
                    wkpoints = 0,
                    catchpoint = 0,
                    stpoint = 0,
                    boundrypoints = 0,
                    sixpoints = 0,
                    runpoints = 0,
                    centuryPoints = 0,
                    halcenturypoints = 0,
                    maidenpoints = 0,
                    total_points = 0,
                    economypoints = 0,
                    strikePoint = 0,
                    batting_points = 0,
                    bowling_points = 0,
                    thirtypoints = 0,
                    fielding_points = 0,
                    wicketbonuspoint = 0;
                let findplayerrole = await matchPlayers.findOne({ playerid: mongoose.Types.ObjectId(row.player_id), matchkey: mongoose.Types.ObjectId(matchid) });
                let wicketbonuspointdata = await resultMatch.find({ matchkey: mongoose.Types.ObjectId(matchid), wplayerid: mongoose.Types.ObjectId(row.player_id) });
                console.log('wicketbonuspointdata', wicketbonuspointdata);
                if (wicketbonuspointdata.length > 0) {
                    wicketbonuspoint = wicketbonuspointdata.length * 8;
                }

                if (format == 't20') {
                    startingpoint = (row.starting11 == 1 && row.innings == 1) ? 4 : 0;
                    // batting points given //
                    if (findplayerrole && findplayerrole.role != constant.ROLE.BOWL) {
                        duckpoint = (row.duck != 0) ? -2 : 0;
                    }
                    boundrypoints = fours * 1;
                    sixpoints = six * 2;

                    runpoints = runs * 1;
                    if ((runs >= 50) && (runs < 100)) {
                        halcenturypoints = 8;
                    } else if ((runs >= 30) && (runs < 50)) {
                        thirtypoints = 4;
                    } else if (runs >= 100) {
                        centuryPoints = 16;
                    }
                    extra_points = extra_points * 1;
                    if (wicket == 3) {
                        wkpoints = wkpoints + 4;
                    }
                    if (wicket == 4) {
                        wkpoints = wkpoints + 8;
                    }
                    if (wicket >= 5) {
                        wkpoints = wkpoints + 16;
                    }
                    wkpoints = wkpoints + wicket * 25;
                    maidenpoints = maiden_over * 12;

                    // fielding points //
                    if (pCatch == 3) {
                        catchpoint = catchpoint + 4;
                    }
                    catchpoint = catchpoint + pCatch * 8;
                    stpoint = stumbed * 12;
                    throwpoint = thrower * 6;
                    hittspoints = hitter * 6;
                    if (overs >= 2) {
                        if (erate < 5) {
                            economypoints = 6;
                        } else if (erate >= 5 && erate <= 5.99) {
                            economypoints = 4;
                        } else if (erate >= 6 && erate <= 7) {
                            economypoints = 2;
                        } else if (erate >= 10 && erate <= 11) {
                            economypoints = -2;
                        } else if (erate >= 11.1 && erate <= 12) {
                            economypoints = -4;
                        } else if (erate >= 12) {
                            economypoints = -6;
                        }
                    }
                    if (findplayerrole && findplayerrole.role != constant.ROLE.BOWL) {
                        if (bballs >= 10) {

                            if (strikerate >= 130 && strikerate <= 150) {
                                strikePoint = 2;
                            } else if (strikerate >= 150.1 && strikerate <= 170) {
                                strikePoint = 4;
                            } else if (strikerate > 170) {
                                strikePoint = 6;
                            } else if (strikerate >= 60 && strikerate <= 70) {
                                strikePoint = -2;
                            } else if (strikerate >= 50 && strikerate <= 59.9) {
                                strikePoint = -4;
                            } else if (strikerate < 50) {
                                strikePoint = -6;
                            }

                        }
                    }
                } else if (format == 't10') {
                    startingpoint = (row.starting11 == 1 && row.innings == 1) ? 4 : 0;
                    // batting points given //
                    if (findplayerrole && findplayerrole.role != constant.ROLE.BOWL) {
                        duckpoint = (row.duck != 0) ? -2 : 0;
                    }
                    boundrypoints = fours * 1;
                    sixpoints = six * 2;

                    runpoints = runs * 1;
                    if ((runs >= 30) && (runs < 50)) {
                        halcenturypoints = 8;
                    } else if (runs >= 50) {
                        centuryPoints = 16;
                    }
                    extra_points = extra_points * 1;
                    // give points for bowling //
                    if (wicket == 2) {
                        wkpoints = wkpoints + 8;
                    }
                    if (wicket >= 3) {
                        wkpoints = wkpoints + 16;
                    }
                    wkpoints = wkpoints + wicket * 25;
                    maidenpoints = maiden_over * 16;

                    // fielding points //

                    if (pCatch == 3) {
                        catchpoint = catchpoint + 4;
                    }
                    catchpoint = catchpoint + pCatch * 8;
                    stpoint = stumbed * 12;
                    throwpoint = thrower * 6;
                    hittspoints = hitter * 6;
                    if (overs >= 1) {
                        if (erate < 7) {
                            economypoints = 6;
                        } else if (erate >= 7 && erate <= 7.99) {
                            economypoints = 4;
                        } else if (erate >= 8 && erate <= 9) {
                            economypoints = 2;
                        } else if (erate >= 14 && erate <= 15) {
                            economypoints = -2;
                        } else if (erate >= 15.1 && erate <= 16) {
                            economypoints = -4;
                        } else if (erate >= 16) {
                            economypoints = -6;
                        }
                    }
                    if (findplayerrole && findplayerrole.role != constant.ROLE.BOWL) {
                        if (bballs >= 5) {
                            if (strikerate >= 150 && strikerate <= 170) {
                                strikePoint = 2;
                            } else if (strikerate >= 170.1 && strikerate <= 190) {
                                strikePoint = 4;
                            } else if (strikerate > 190) {
                                strikePoint = 6;
                            } else if (strikerate >= 70 && strikerate <= 80) {
                                strikePoint = -2;
                            } else if (strikerate >= 60 && strikerate <= 69.99) {
                                strikePoint = -4;
                            } else if (strikerate < 60) {
                                strikePoint = -6;
                            }
                        }
                    }
                } else if (format == 'one-day') {
                    startingpoint = (row.starting11 == 1 && row.innings == 1) ? 4 : 0;
                    // batting points given //
                    if (findplayerrole && findplayerrole.role != constant.ROLE.BOWL) {
                        duckpoint = (row.duck != 0) ? -2 : 0;
                    }
                    boundrypoints = fours * 1;
                    sixpoints = six * 2;
                    runpoints = runs * 1;
                    if ((runs >= 50) && (runs < 100)) {
                        halcenturypoints = 4;
                    } else if (runs >= 100) {
                        centuryPoints = 8;
                    }
                    extra_points = extra_points * 1;
                    // give points for bowling //
                    if (wicket == 4) {
                        wkpoints = wkpoints + 4;
                    }
                    if (wicket >= 5) {
                        wkpoints = wkpoints + 8;
                    }
                    wkpoints = wkpoints + wicket * 25;
                    maidenpoints = maiden_over * 4;

                    // fielding points //

                    if (pCatch == 3) {
                        catchpoint = catchpoint + 4;
                    }
                    catchpoint = catchpoint + pCatch * 8;

                    stpoint = stumbed * 12;
                    throwpoint = thrower * 6;
                    hittspoints = hitter * 6;
                    if (overs >= 5) {
                        if (erate < 2.5) {
                            economypoints = 6;
                        } else if (erate >= 2.5 && erate <= 3.49) {
                            economypoints = 4;
                        } else if (erate >= 3.5 && erate <= 4.5) {
                            economypoints = 2;
                        } else if (erate >= 7 && erate <= 8) {
                            economypoints = -2;
                        } else if (erate >= 8.1 && erate <= 9) {
                            economypoints = -4;
                        } else if (erate >= 9) {
                            economypoints = -6;
                        }
                    }

                    if (findplayerrole && findplayerrole.role != constant.ROLE.BOWL) {
                        if (bballs >= 20) {
                            if (strikerate >= 100 && strikerate <= 120) {
                                strikePoint = 2;
                            } else if (strikerate >= 120.1 && strikerate <= 140) {
                                strikePoint = 4;
                            } else if (strikerate > 140) {
                                strikePoint = 6;
                            } else if (strikerate >= 40 && strikerate <= 50) {
                                strikePoint = -2;
                            } else if (strikerate >= 30 && strikerate <= 39.9) {
                                strikePoint = -4;
                            } else if (strikerate < 30) {
                                strikePoint = -6;
                            }

                        }

                    }
                } else {

                    startingpoint = (row.starting11 == 1 && row.innings == 1) ? 4 : 0;
                    // batting points given //
                    if (findplayerrole && findplayerrole.role != constant.ROLE.BOWL) {
                        duckpoint = (row.duck != 0) ? -2 : 0;
                    }
                    boundrypoints = fours * 1;
                    sixpoints = six * 2;
                    runpoints = runs * 1;
                    if ((runs >= 50) && (runs < 100)) {
                        halcenturypoints = 4;
                    } else if (runs >= 100) {
                        centuryPoints = 8;
                    }
                    extra_points = extra_points * 1;
                    // give points for bowling //
                    if (wicket == 4) {
                        wkpoints = wkpoints + 4;
                    }
                    if (wicket >= 5) {
                        wkpoints = wkpoints + 8;
                    }
                    wkpoints = wkpoints + wicket * 16;

                    // fielding points //

                    catchpoint = pCatch * 8;
                    stpoint = stumbed * 12;
                    throwpoint = thrower * 6;
                    hittspoints = hitter * 6;
                }
                if (row.starting11 == 1) {
                    result.batting_points = runpoints + sixpoints + boundrypoints + strikePoint + halcenturypoints + centuryPoints + thirtypoints;
                    result.fielding_points = catchpoint + stpoint + throwpoint + hittspoints;
                    result.bowling_points = wkpoints + maidenpoints + economypoints + wicketbonuspoint;
                    total_points = result.total_points = startingpoint + runpoints + sixpoints + halcenturypoints + centuryPoints + boundrypoints + strikePoint + catchpoint + stpoint + wkpoints + maidenpoints + economypoints + duckpoint + hittspoints + throwpoint + wicketbonuspoint + thirtypoints;
                } else {
                    result.batting_points = 0;
                    result.fielding_points = 0;
                    result.bowling_points = 0;
                    total_points = result.total_points = 0;
                }
                await resultMatch.updateOne({ _id: mongoose.Types.ObjectId(row._id) }, {
                    $set: result
                });
                resultpoints['matchkey'] = mongoose.Types.ObjectId(matchid);
                resultpoints['player_id'] = mongoose.Types.ObjectId(row.player_id);
                if (row.starting11 == 1) {
                    resultpoints['startingpoints'] = startingpoint;
                    resultpoints['runs'] = runpoints;
                    resultpoints['fours'] = boundrypoints;
                    resultpoints['sixs'] = sixpoints;
                    resultpoints['strike_rate'] = strikePoint;
                    resultpoints['halfcentury'] = halcenturypoints;
                    resultpoints['century'] = centuryPoints;
                    resultpoints['wickets'] = wkpoints;
                    resultpoints['maidens'] = maidenpoints;
                    resultpoints['economy_rate'] = economypoints;
                    resultpoints['catch'] = catchpoint;
                    resultpoints['stumping'] = stpoint;
                    resultpoints['thrower'] = throwpoint;
                    resultpoints['hitter'] = hittspoints;
                    resultpoints['stumping'] = stpoint;
                    resultpoints['negative'] = duckpoint;
                    resultpoints['thirtypoints'] = thirtypoints;
                    resultpoints['wicketbonuspoint'] = wicketbonuspoint;
                    resultpoints['total'] = total_points;
                } else {
                    resultpoints['startingpoints'] = 0;
                    resultpoints['runs'] = 0;
                    resultpoints['fours'] = 0;
                    resultpoints['sixs'] = 0;
                    resultpoints['strike_rate'] = 0;
                    resultpoints['halfcentury'] = 0;
                    resultpoints['century'] = 0;
                    resultpoints['wickets'] = 0;
                    resultpoints['maidens'] = 0;
                    resultpoints['economy_rate'] = 0;
                    resultpoints['catch'] = 0;
                    resultpoints['stumping'] = 0;
                    resultpoints['negative'] = 0;
                    resultpoints['wicketbonuspoint'] = 0;
                    resultpoints['thirtypoints'] = 0;
                    resultpoints['total'] = 0;
                }
                let pointsData = await resultPoint.findOne({ matchkey: mongoose.Types.ObjectId(matchid), resultmatch_id: mongoose.Types.ObjectId(row._id), playerid: mongoose.Types.ObjectId(row.player_id) });
                if (pointsData) {
                    await resultPoint.updateOne({ _id: mongoose.Types.ObjectId(pointsData._id) }, {
                        $set: resultpoints
                    });
                } else {
                    resultpoints['resultmatch_id'] = row._id;
                    await resultPoint.create(resultpoints);
                }
            }
        }
        await this.updatePlayerPoints(matchid);
    }
    async updatePlayerPoints(matchid) {
        let pipeline = [];

        pipeline.push({
            $match: { matchkey: mongoose.Types.ObjectId(matchid) }
        })
        pipeline.push({
            $lookup: {
                from: 'resultpoints',
                localField: 'playerid',
                foreignField: 'player_id',
                as: 'resultPointData'
            }
        })
        pipeline.push({
            $unwind: { path: "$resultPointData" }
        })
        pipeline.push({
            $group: {
                _id: '$_id',
                total: {
                    $sum: "$resultPointData.total"
                }
            }
        });

        let getMatchPlayers = await matchPlayers.aggregate(pipeline);
        if (getMatchPlayers.length > 0) {
            for (let players of getMatchPlayers) {
                // console.log('players----', players);
                await matchPlayers.updateOne({ _id: mongoose.Types.ObjectId(players._id) }, {
                    $set: {
                        points: players.total
                    }
                });
            }
        }
        await this.userpoints(matchid);
    }
    async userpoints(matchid) {
        let joinTeamList = await joinTeam.find({ matchkey: mongoose.Types.ObjectId(matchid) });
        let allMatchPlayers = await this.findMatchPlayers(matchid);
        if (joinTeamList.length > 0) {
            for (let team of joinTeamList) {
                let result = {};
                let user_points = 0;
                let players = team.players
                for (let player of allMatchPlayers) {
                    let pid = player.playerid
                    let findPlayer = await players.find(element => element.toString() == pid.toString());
                    if (findPlayer) {
                        if (team.captain.toString() == pid.toString()) {
                            user_points = user_points + (player.points * 2);
                        } else if (team.vicecaptain.toString() == pid.toString()) {
                            user_points = user_points + (player.points * 1.5);
                        } else {
                            user_points = user_points + player.points;
                        }
                    } else {
                        user_points = user_points;
                    }
                }
                if (team.points != user_points) {
                    result['lastpoints'] = team.points;
                }
                result['points'] = user_points;
                await joinTeam.updateOne({ _id: mongoose.Types.ObjectId(team._id) }, {
                    $set: result
                });
            }
        }
    }

    async refundAmount() {
        const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
        let match_time = moment().subtract(10, 'm').format('YYYY-MM-DD HH:mm:ss');
        let pipeline = [];
        pipeline.push({
            $match: {
                fantasy_type: "Cricket",
                start_date: { $lte: match_time },
                launch_status: 'launched',
                final_status: { $nin: ["winnerdeclared", "IsCanceled"] }
            }
        });
        pipeline.push({
            $lookup: {
                from: 'matchchallenges',
                let: { matckey: "$_id" },
                pipeline: [{
                    $match: {
                        status: { $ne: "canceled" },
                        $expr: {
                            $and: [
                                { $eq: ["$matchkey", "$$matckey"] },
                            ],
                        },
                    },
                }, ],
                as: 'matchChallengesData'
            }
        })
        let listmatches = await listMatches.aggregate(pipeline);
        if (listmatches.length > 0) {
            for (let match of listmatches) {

                if (match.matchChallengesData.length > 0) {
                    for (let value1 of match.matchChallengesData) {
                        let data = {};
                        if (value1.maximum_user > value1.joinedusers) {
                            if (value1.confirmed_challenge == 0) {
                                let getresponse = await this.refundprocess(value1._id, value1.entryfee, match._id, 'challenge cancel');
                                if (getresponse == true) {
                                    await matchChallenge.updateOne({ _id: mongoose.Types.ObjectId(value1._id) }, {
                                        $set: {
                                            status: 'canceled'
                                        }
                                    });
                                }
                            }
                        }
                        if (value1.pricecard_type == 'Percentage') {
                            let joinedUsers = await joinLeague.find({
                                matchkey: mongoose.Types.ObjectId(match.matchkey),
                                challengeid: mongoose.Types.ObjectId(value1._id),
                            }).count();
                            if (value1.confirmed_challenge == 1 && joinedUsers == 1) {
                                let getresponse = await this.refundprocess(value1._id, value1.entryfee, match.matchkey, 'challenge cancel');
                                if (getresponse == true) {
                                    data['status'] = 'canceled';
                                    await matchChallenge.updateOne({ _id: mongoose.Types.ObjectId(value1._id) }, {
                                        $set: {
                                            status: 'canceled'
                                        }
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
        return true;
    }
    async refundprocess(challengeid, entryfee, matchkey, reason) {
        let joinLeagues = await joinLeague.find({
            matchkey: mongoose.Types.ObjectId(matchkey),
            challengeid: mongoose.Types.ObjectId(challengeid),
        });
        if (joinLeagues.length > 0) {
            for (let league of joinLeagues) {
                let leaugestransaction = league.leaugestransaction;
                let refund_data = await refundMatch.findOne({ joinid: mongoose.Types.ObjectId(league._id) });
                if (!refund_data) {
                    const user = await userModel.findOne({ _id: leaugestransaction.user_id }, { userbalance: 1 });
                    if (user) {
                        const bonus = parseFloat(user.userbalance.bonus.toFixed(2));
                        const balance = parseFloat(user.userbalance.balance.toFixed(2));
                        const winning = parseFloat(user.userbalance.winning.toFixed(2));
                        const totalBalance = bonus + balance + winning;
                        const userObj = {
                            'userbalance.balance': balance + leaugestransaction.balance,
                            'userbalance.bonus': bonus + leaugestransaction.bonus,
                            'userbalance.winning': winning + leaugestransaction.winning,
                        };
                        let transaction_id = `${constant.APP_SHORT_NAME}-${league._id}-${Date.now()}-${leaugestransaction.user_id}`;
                        let refundData = {
                            userid: leaugestransaction.user_id,
                            amount: entryfee,
                            joinid: league._id,
                            challengeid: league.challengeid,
                            matchkey: matchkey,
                            reason: reason,
                            transaction_id: transaction_id
                        };
                        const transactiondata = {
                            type: 'Refund',
                            amount: entryfee,
                            total_available_amt: totalBalance + entryfee,
                            transaction_by: constant.APP_SHORT_NAME,
                            challengeid: challengeid,
                            userid: leaugestransaction.user_id,
                            paymentstatus: constant.PAYMENT_STATUS_TYPES.CONFIRMED,
                            bal_bonus_amt: bonus + leaugestransaction.bonus,
                            bal_win_amt: winning + leaugestransaction.winning,
                            bal_fund_amt: balance + leaugestransaction.balance,
                            bonus_amt: leaugestransaction.bonus,
                            win_amt: leaugestransaction.winning,
                            addfund_amt: leaugestransaction.balance,
                            transaction_id: transaction_id
                        };
                        await Promise.all([
                            userModel.findOneAndUpdate({ _id: leaugestransaction.user_id }, userObj, { new: true }),
                            refundMatch.create(refundData),
                            TransactionModel.create(transactiondata)
                        ]);
                    }
                }
            }
        }
        return true;
    }
    async distributeWinningAmount(req) {
        let { id, status } = req.params;
        let matchkey = id;
        let match_time = moment().subtract(10, 'm').format('YYYY-MM-DD HH:mm:ss');
        let pipeline = [];
        pipeline.push({
            $match: {
                _id: mongoose.Types.ObjectId(matchkey),
                launch_status: 'launched',
                final_status: { $nin: ["winnerdeclared", "IsCanceled", "IsAbandoned"] }
            }
        });
        pipeline.push({
            $lookup: {
                from: 'matchchallenges',
                let: { matckey: "$_id" },
                pipeline: [{
                    $match: {
                        status: { $ne: "canceled" },
                        // _id:mongoose.Types.ObjectId("62554fd77ac6f75384091f92"),
                        $expr: {
                            $and: [
                                { $eq: ["$matchkey", "$$matckey"] },
                            ],
                        },
                    },
                }, ],
                as: 'matchChallengesData'
            }
        })
        let listmatches = await listMatches.aggregate(pipeline);
        if (listmatches.length > 0) {
            for (let challenge of listmatches[0].matchChallengesData) {
                let pipeline1 = [];
                pipeline1.push({
                    $match: {
                        matchkey: mongoose.Types.ObjectId(listmatches[0]._id),
                        challengeid: mongoose.Types.ObjectId(challenge._id)
                    }
                });
                pipeline1.push({
                    $lookup: {
                        from: 'jointeams',
                        localField: 'teamid',
                        foreignField: '_id',
                        as: 'joinTeamData'
                    }
                });
                pipeline1.push({
                    $unwind: {
                        path: "$joinTeamData"
                    }
                });
                pipeline1.push({
                    $project: {
                        _id: 1,
                        "points": "$joinTeamData.points",
                        userid: 1
                    }
                });
                let joinedusers = await joinLeague.aggregate(pipeline1);

                if (joinedusers.length > 0) {
                    let prc_arr = [];
                    if (challenge.contest_type == 'Amount') {
                        if (challenge.pricecard_type == 'Amount') {
                            if (challenge.matchpricecards) {
                                for (let prccrd of challenge.matchpricecards) {
                                    let min_position = prccrd.min_position;
                                    let max_position = prccrd.max_position;
                                    for (let i = min_position; i < max_position; i++) {
                                        prc_arr[i + 1] = prccrd.price;
                                    }
                                }
                            } else {
                                prc_arr[1] = challenge.win_amount;
                            }
                        } else {
                            if (challenge.matchpricecards) {
                                for (let prccrd of challenge.matchpricecards) {
                                    let min_position = prccrd.min_position;
                                    let max_position = prccrd.max_position;
                                    for (let i = min_position; i < max_position; i++) {
                                        prc_arr[i + 1] = (prccrd.price_percent / 100) * (challenge.win_amount);
                                    }
                                }
                            } else {
                                prc_arr[1] = challenge.win_amount;
                            }
                        }
                    } else if (challenge.contest_type == 'Percentage') {
                        let getwinningpercentage = challenge.winning_percentage;
                        let gtjnusers = challenge.joinedusers;
                        let toWin = Math.floor(gtjnusers * getwinningpercentage / 100);
                        prc_arr = [];
                        for (let i = 0; i < toWin; i++) {
                            prc_arr[i + 1] = challenge.win_amount;
                        }
                    }
                    let user_points = [];
                    if (joinedusers.length > 0) {
                        let lp = 0;
                        for (let jntm of joinedusers) {
                            user_points[lp] = {};
                            user_points[lp]['id'] = jntm.userid.toString();
                            user_points[lp]['points'] = jntm.points;
                            user_points[lp]['joinedid'] = jntm._id.toString();
                            lp++;
                        }
                    }
                    user_points.sort((a, b) => {
                        return b.points - a.points;
                    });



                    let poin_user = [];
                    let ids_str = "";
                    let userids_str = "";
                    for (let usr of user_points) {
                        let indexings = poin_user.findIndex(element => element.points == usr.points);
                        if (indexings == -1) {
                            poin_user.push({
                                id: [usr.id],
                                points: usr.points,
                                joinedid: [usr.joinedid]
                            });
                        } else {
                            let ids_arr = [];
                            let userids_arr = [];
                            let getdatatype = Array.isArray(poin_user[indexings].joinedid);
                            if (getdatatype) {
                                ids_arr = [];
                                userids_arr = [];
                                ids_str = poin_user[indexings].joinedid.join(',');
                                ids_str = ids_str + ',' + usr.joinedid;
                                ids_arr = ids_str.split(',');
                                userids_str = poin_user[indexings].id.join(',');
                                userids_str = userids_str + ',' + usr.id;
                                userids_arr = userids_str.split(',');
                                poin_user[indexings].joinedid = ids_arr;
                                poin_user[indexings].id = userids_arr;
                                poin_user[indexings].points = usr.points;
                            } else {
                                ids_arr = [];
                                userids_arr = [];
                                ids_str = poin_user[indexings].joinedid;
                                ids_str = ids_str + ',' + usr.joinedid;
                                ids_arr = ids_str.split(',');
                                userids_str = poin_user[indexings].id;
                                userids_str = userids_str + ',' + usr.id;
                                userids_arr = userids_str.split(',');
                                poin_user[indexings].joinedid = ids_arr;
                                poin_user[indexings].id = userids_arr;
                                poin_user[indexings].points = usr.points;
                            }
                        }
                    }
                    poin_user.sort((a, b) => {
                        return b.points - a.points;
                    });

                    let win_usr = [];
                    let win_cnt = 0;
                    let count = prc_arr.length;
                    // console.log('count',count);
                    for (let [k, pu] of poin_user.entries()) {
                        if (win_cnt < count) {
                            // console.log('win_cnt',win_cnt);
                            // console.log('pu',pu);
                            // console.log('k------------',k);
                            // let obj1 = {};
                            win_usr[k] = {};
                            win_usr[k]['min'] = win_cnt + 1;
                            win_cnt = win_cnt + pu['joinedid'].length;
                            win_usr[k]['max'] = win_cnt;
                            win_usr[k]['count'] = pu['joinedid'].length;
                            win_usr[k]['joinedid'] = pu['joinedid'];
                            win_usr[k]['id'] = pu['id'];
                            win_usr[k]['points'] = pu['points'];
                            // win_usr.push(obj1);
                        } else {
                            break;
                        }
                    }
                    // console.log('win_usr win_usr-----------------' , win_usr);
                    let final_poin_user = [];
                    for (let [ks, ps] of win_usr.entries()) {
                        if (prc_arr[ps['min']]) {
                            if (ps['count'] == 1) {
                                let obj2 = {};
                                obj2[ps['joinedid'][0]] = {};
                                obj2[ps['joinedid'][0]]['points'] = ps['points'];
                                obj2[ps['joinedid'][0]]['amount'] = prc_arr[ps['min']];
                                obj2[ps['joinedid'][0]]['rank'] = ps['min'];
                                obj2[ps['joinedid'][0]]['userid'] = ps['id'][0];
                                final_poin_user.push(obj2);
                                // console.log('win_usr final_poin_user' , final_poin_user);
                            } else {
                                let ttl = 0;
                                let avg_ttl = 0;
                                for (let jj = ps['min']; jj <= ps['max']; jj++) {
                                    let sm = 0;
                                    if (prc_arr[jj]) {
                                        sm = prc_arr[jj];
                                    }
                                    ttl = ttl + sm;
                                }
                                avg_ttl = ttl / ps['count'];
                                for (let [keyuser, fnl] of ps['joinedid'].entries()) {
                                    let obj3 = {};
                                    obj3[fnl] = {};
                                    obj3[fnl]['points'] = ps['min'];
                                    obj3[fnl]['amount'] = avg_ttl;
                                    obj3[fnl]['rank'] = ps['min'];
                                    obj3[fnl]['userid'] = ps['id'][keyuser];
                                    final_poin_user.push(obj3);
                                }
                            }
                        }
                    }
                    // console.log('final_poin_user',final_poin_user);

                    if (final_poin_user.length > 0) {
                        for (let finalPoints of final_poin_user) {
                            let fpusv = Object.values(finalPoints)[0];
                            let fpuskjoinid = Object.keys(finalPoints)[0];
                            let fpusk = fpusv['userid'];
                            let checkWinning = await finalResultModel.findOne({ joinedid: mongoose.Types.ObjectId(fpuskjoinid) });
                            if (!checkWinning) {
                                let transactionidsave = `${constant.APP_SHORT_NAME}-WIN-${Date.now()}-${fpuskjoinid}`;
                                let finalResultArr = {
                                    userid: fpusk,
                                    points: fpusv['points'],
                                    amount: fpusv['amount'].toFixed(2),
                                    rank: fpusv['rank'],
                                    matchkey: matchkey,
                                    challengeid: challenge._id,
                                    seriesid: listmatches[0].series,
                                    transaction_id: transactionidsave,
                                    joinedid: fpuskjoinid
                                };
                                let checkWinningUser = await finalResultModel.findOne({
                                    joinedid: mongoose.Types.ObjectId(fpuskjoinid),
                                    userid: mongoose.Types.ObjectId(fpusk)
                                });
                                if (!checkWinning) {
                                    await finalResultModel.create(finalResultArr);
                                    const user = await userModel.findOne({ _id: fpusk }, { userbalance: 1, totalwinning: 1 });
                                    if (user) {
                                        if (fpusv['amount'] > 10000) {
                                            const bonus = parseFloat(user.userbalance.bonus.toFixed(2));
                                            const balance = parseFloat(user.userbalance.balance.toFixed(2));
                                            const winning = parseFloat(user.userbalance.winning.toFixed(2));
                                            const totalwinning = parseFloat(user.totalwinning.toFixed(2));
                                            const totalBalance = bonus + balance + winning;

                                            let tds_amount = (31.2 / 100) * fpusv['amount'];
                                            let amount = fpusv['amount'] - tds_amount;
                                            let tdsData = {
                                                userid: fpusk,
                                                amount: fpusv['amount'],
                                                tds_amount: tds_amount,
                                                challengeid: challenge._id,
                                                seriesid: listmatches[0].series
                                            };
                                            const userObj = {
                                                'userbalance.balance': balance,
                                                'userbalance.bonus': bonus,
                                                'userbalance.winning': winning + amount,
                                                'totalwinning': totalwinning + amount
                                            };
                                            const transactiondata = {
                                                type: 'Challenge Winning Amount',
                                                amount: amount,
                                                total_available_amt: totalBalance + amount,
                                                transaction_by: constant.APP_SHORT_NAME,
                                                challengeid: challenge._id,
                                                userid: fpusk,
                                                paymentstatus: constant.PAYMENT_STATUS_TYPES.CONFIRMED,
                                                bal_bonus_amt: bonus,
                                                bal_win_amt: winning + amount,
                                                bal_fund_amt: balance,
                                                win_amt: amount,
                                                transaction_id: transactionidsave
                                            };
                                            await Promise.all([
                                                userModel.findOneAndUpdate({ _id: fpusk }, userObj, { new: true }),
                                                tdsDetailModel.create(tdsData),
                                                TransactionModel.create(transactiondata)
                                            ]);
                                        } else {
                                            const bonus = parseFloat(user.userbalance.bonus.toFixed(2));
                                            const balance = parseFloat(user.userbalance.balance.toFixed(2));
                                            const winning = parseFloat(user.userbalance.winning.toFixed(2));
                                            const totalwinning = parseFloat(user.totalwinning.toFixed(2));
                                            const totalBalance = bonus + balance + winning;
                                            let amount = fpusv['amount'];
                                            const userObj = {
                                                'userbalance.balance': balance,
                                                'userbalance.bonus': bonus,
                                                'userbalance.winning': winning + amount,
                                                'totalwinning': totalwinning + amount

                                            };
                                            const transactiondata = {
                                                type: 'Challenge Winning Amount',
                                                amount: amount,
                                                total_available_amt: totalBalance + amount,
                                                transaction_by: constant.APP_SHORT_NAME,
                                                challengeid: challenge._id,
                                                userid: fpusk,
                                                paymentstatus: constant.PAYMENT_STATUS_TYPES.CONFIRMED,
                                                bal_bonus_amt: bonus,
                                                bal_win_amt: winning + amount,
                                                bal_fund_amt: balance,
                                                win_amt: amount,
                                                transaction_id: transactionidsave
                                            };
                                            await Promise.all([
                                                userModel.findOneAndUpdate({ _id: fpusk }, userObj, { new: true }),
                                                TransactionModel.create(transactiondata)
                                            ]);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return true;
    }

    async checkIfArray(globalarray, userpoints) {
        return new Promise((resolve) => {
            var theIndex = -1;
            for (var i = 0; i < globalarray.length; i++) {
                if (globalarray[i].points == userpoints) {
                    theIndex = i;
                    resolve(theIndex);
                }
            }
            if (i >= globalarray.length) {
                resolve(theIndex);
            }

        })
    }

    async allRefundAmount(req, reason) {
        let { id, status } = req.params;
        let machanllengeData = await matchChallenge.find({ matchkey: mongoose.Types.ObjectId(id) });
        if (machanllengeData.length > 0) {
            for (let challenge of machanllengeData) {
                let getresponse = await this.refundprocess(challenge._id, challenge.entryfee, id, reason);
                if (getresponse == true) {
                    await matchChallenge.updateOne({ _id: mongoose.Types.ObjectId(challenge._id) }, {
                        $set: {
                            status: 'canceled'
                        }
                    });
                }
            }
        }
    }

}

module.exports = new resultServices();