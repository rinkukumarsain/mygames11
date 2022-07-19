const { default: axios } = require("axios")
const mongoose=require("mongoose");
const listMatchModel = require("../../models/listMatchesModel");
const teamModel = require("../../models/teamModel");
const seriesModel = require("../../models/addSeriesModel");
const playersModel = require("../../models/playerModel");
const matchPlayersModel = require("../../models/matchPlayersModel");
const moment = require('moment');
const status = {
    1: 'notstarted',
    2: 'completed',
    3: 'started',
    4: 'completed'
}
const format = {
    1: 'one-day',
    2: 'test',
    3: 't20',
    4: 'one-day',
    5: 'test',
    6: 't20',
    7: 'one-day',
    8: 't20',
    9: 'one-day',
    10: 't20',
    17: 't10',
    18: 'the-hundred',
    19: 'the-hundred'
}
const toss_decision = {
    0: null,
    1: 'batting',
    2: 'bowling'
}
const role = {
    'bowl': 'bowler',
    'bat': 'batsman',
    'all': 'allrounder',
    'wk': 'keeper',
    'wkbat': 'keeper',
    'cap': 'allrounder',
    'squad': 'allrounder',
}
class cricketApiController {
    constructor() {
        return {
            listOfMatches: this.listOfMatches.bind(this),
            listOfMatches_entity: this.listOfMatches_entity.bind(this),
            fetchPlayerByMatch_entity: this.fetchPlayerByMatch_entity.bind(this),
            getmatchscore: this.getmatchscore.bind(this),
            
        }
    }
    listOfMatches(req, res) {
        try {
            axios.get('http://167.71.225.28/matchesinfo/getavailablematches#').then(async(result) => {
                this.newMethod(result);
            });
            res.send({ success: true });
        } catch (error) {
            console.log(error)
        }
    }


    newMethod(result) {
        for (let obkey1 of Object.values(result.data)) {
            obkey1.matches.flatMap(async(Obj) => {
                // console.log("x..........",Obj)
                const checkMatchkey = await listMatchModel.find({ real_matchkey: Obj.matchkey });
                // console.log("checkMatchkey.....",checkMatchkey);
                if (checkMatchkey.length == 0) {
                    // console.log("checkMatchkey.team1key.......",checkMatchkey.team1key);
                    await axios.get(`http://167.71.225.28/matchesinfo/getMatchData/${Obj.matchkey}`).then(async(matchData) => {
                        // console.log("checkMatchkey.team1key.......", Obj.matchkey);
                        let matchDATA = JSON.parse(matchData.data.matchdata);
                        // console.log('matchData', matchDATA);
                        if (matchDATA) {
                            if (moment(moment(matchDATA.data.card.start_date.iso).format()).isAfter(moment().format())) {
                                let insertTeam1 = new teamModel({
                                    fantasy_type: 'Cricket',
                                    teamName: matchDATA.data.card.teams.a.name,
                                    team_key: matchDATA.data.card.teams.a.key,
                                    short_name: matchDATA.data.card.teams.a.short_name
                                });
                                let temaData1 = await insertTeam1.save();
                                // console.log('teamDAta=======1======', temaData1._id);
                                let insertTeam2 = new teamModel({
                                    fantasy_type: 'Cricket',
                                    teamName: matchDATA.data.card.teams.b.name,
                                    team_key: matchDATA.data.card.teams.b.key,
                                    short_name: matchDATA.data.card.teams.a.short_name
                                });
                                let temaData2 = await insertTeam2.save();
                                // console.log('teamDAta---------2--------', temaData2._id);

                                let insertListmatch = new listMatchModel({
                                    fantasy_type: 'Cricket',
                                    name: matchDATA.data.card.name,
                                    team1Id: temaData1._id,
                                    team2Id: temaData2._id,
                                    real_matchkey: matchDATA.data.card.key,
                                    start_date: moment(matchDATA.data.card.start_date.iso).format('YYYY-MM-DD hh:mm:ss'),
                                    status: matchDATA.data.card.status,
                                    format: matchDATA.data.card.format,
                                    launch_status: 'pending',
                                    final_status: 'pending',
                                    status_overview: matchDATA.data.card.status_overview,
                                });
                                let insertMatchList = await insertListmatch.save();
                                // console.log('insertMatchList----------insertMatchList----insertMatchList---', insertMatchList);

                            }
                        }

                    });
                } else {
                    await axios.get(`http://167.71.225.28/matchesinfo/getMatchData/${Obj.matchkey}`).then(async(matchData) => {
                        let matchDATA = JSON.parse(matchData.data.matchdata);
                        if (matchDATA) {
                            if (moment(moment(matchDATA.data.card.start_date.iso).format()).isAfter(moment().format())) {
                                let insertTeam1 = new teamModel({
                                    fantasy_type: 'Cricket',
                                    teamName: matchDATA.data.card.teams.a.name,
                                    team_key: matchDATA.data.card.teams.a.key,
                                    short_name: matchDATA.data.card.teams.a.short_name
                                });
                                let temaData1 = await insertTeam1.save();
                                // console.log('teamDAta===ELSE====1======', temaData1._id);
                                let insertTeam2 = new teamModel({
                                    fantasy_type: 'Cricket',
                                    teamName: matchDATA.data.card.teams.b.name,
                                    team_key: matchDATA.data.card.teams.b.key,
                                    short_name: matchDATA.data.card.teams.a.short_name
                                });
                                let temaData2 = await insertTeam2.save();
                                // console.log('teamDAta----ELSE-----2--------', temaData2._id);
                                const updateListMatch = await listMatchModel.findOneAndUpdate({ real_matchkey: matchDATA.data.card.key }, {
                                    $set: {
                                        name: matchDATA.data.card.name,
                                        team1Id: temaData1._id,
                                        team2Id: temaData2._id,
                                        start_date: moment(matchDATA.data.card.start_date.iso).format('YYYY-MM-DD hh:mm:ss'),
                                        status: matchDATA.data.card.status,
                                        format: matchDATA.data.card.format,
                                        status_overview: matchDATA.data.card.status_overview,
                                    }
                                });
                                // if(updateListMatch){
                                //     console.log("update suceessfull...........................")
                                // }




                            }
                        }


                    })

                }
            });


        }
    }
    listOfMatches_entity(req, res) {
        try {
            let pageno = 1;
            axios.get(`https://rest.entitysport.com/v2/matches/?status=1&token=ec471071441bb2ac538a0ff901abd249&per_page=50&&paged=${pageno}`).then(async(matchData) => {
                // console.log('matchData', matchData.data);
                await this.child_listOfMatches_entity(matchData.data.response.items);
                res.redirect('/view_AllUpcomingMatches');
            })
        } catch (error) {
            next(error);
        }
    }

    async child_listOfMatches_entity(items) {
        for (let match of items) {
            const checkMatchkey = await listMatchModel.find({ real_matchkey: match.match_id });
            if (checkMatchkey.length == 0) {
                if (moment(moment(match.date_start_ist).format()).isAfter(moment().format())) {
                    let temaData1, temaData2, series;
                    if (await teamModel.findOne({ team_key: match.teama.team_id })) {
                        temaData1 = await teamModel.findOneAndUpdate({ team_key: match.teama.team_id }, {
                            $set: {
                                teamName: match.teama.name,
                                short_name: match.teama.short_name,
                                logo: match.teama.logo_url
                            }
                        }, { new: true });
                    } else {
                        let insertTeam1 = new teamModel({
                            fantasy_type: 'Cricket',
                            teamName: match.teama.name,
                            team_key: match.teama.team_id,
                            short_name: match.teama.short_name,
                            logo: match.teama.logo_url
                        });
                        temaData1 = await insertTeam1.save();
                    }

                    if (await teamModel.findOne({ team_key: match.teamb.team_id })) {
                        temaData2 = await teamModel.findOneAndUpdate({ team_key: match.teamb.team_id }, {
                            $set: {
                                teamName: match.teamb.name,
                                short_name: match.teamb.short_name,
                                logo: match.teamb.logo_url
                            }
                        }, { new: true });
                    } else {
                        let insertTeam2 = new teamModel({
                            fantasy_type: 'Cricket',
                            teamName: match.teamb.name,
                            team_key: match.teamb.team_id,
                            short_name: match.teamb.short_name,
                            logo: match.teamb.logo_url
                        });
                        temaData2 = await insertTeam2.save();
                    }

                    if (await seriesModel.findOne({ series_key: match.competition.cid })) {
                        series = await seriesModel.findOneAndUpdate({ series_key: match.competition.cid }, {
                            $set: {
                                name: match.competition.title,
                                status: match.competition.status == 'live' ? 'opened' : 'closed',
                                start_date: `${match.competition.datestart} 00:00:00`,
                                end_date: `${match.competition.dateend} 23:59:59`
                            }
                        }, { new: true });
                    } else {
                        let seriesData = new seriesModel({
                            fantasy_type: 'Cricket',
                            name: match.competition.title,
                            series_key: match.competition.cid,
                            status: match.competition.status == 'live' ? 'opened' : 'closed',
                            start_date: `${match.competition.datestart} 00:00:00`,
                            end_date: `${match.competition.dateend} 23:59:59`
                        })
                        series = await seriesData.save();
                    }
                    let insertListmatch = new listMatchModel({
                        fantasy_type: 'Cricket',
                        name: match.title,
                        short_name: match.short_title,
                        team1Id: temaData1._id,
                        team2Id: temaData2._id,
                        series: series._id,
                        real_matchkey: match.match_id,
                        start_date: match.date_start_ist,
                        status: status[match.status],
                        format: format[match.format],
                        launch_status: 'pending',
                        final_status: 'pending',
                        tosswinner_team: match.toss.winner != 0 ? match.toss.winner : null,
                        toss_decision: toss_decision[match.toss.decision],
                    });
                    let insertMatchList = await insertListmatch.save();
                }
            } else {
                if (moment(moment(match.date_start_ist).format()).isAfter(moment().format())) {
                    // if(await teamModel.find({}))
                    let temaData1, temaData2, series;
                    if (await teamModel.findOne({ team_key: match.teama.team_id })) {
                        temaData1 = await teamModel.findOneAndUpdate({ team_key: match.teama.team_id }, {
                            $set: {
                                teamName: match.teama.name,
                                short_name: match.teama.short_name,
                                logo: match.teama.logo_url
                            }
                        }, { new: true });
                    } else {
                        let insertTeam1 = new teamModel({
                            fantasy_type: 'Cricket',
                            teamName: match.teama.name,
                            team_key: match.teama.team_id,
                            short_name: match.teama.short_name,
                            logo: match.teama.logo_url
                        });
                        temaData1 = await insertTeam1.save();
                    }

                    if (await teamModel.findOne({ team_key: match.teamb.team_id })) {
                        temaData2 = await teamModel.findOneAndUpdate({ team_key: match.teamb.team_id }, {
                            $set: {
                                teamName: match.teamb.name,
                                short_name: match.teamb.short_name,
                                logo: match.teamb.logo_url
                            }
                        }, { new: true });
                    } else {
                        let insertTeam2 = new teamModel({
                            fantasy_type: 'Cricket',
                            teamName: match.teamb.name,
                            team_key: match.teamb.team_id,
                            short_name: match.teamb.short_name,
                            logo: match.teamb.logo_url
                        });
                        temaData2 = await insertTeam2.save();
                    }

                    if (await seriesModel.findOne({ series_key: match.competition.cid })) {
                        series = await seriesModel.findOneAndUpdate({ series_key: match.competition.cid }, {
                            $set: {
                                name: match.competition.title,
                                status: match.competition.status == 'live' ? 'opened' : 'closed',
                                start_date: `${match.competition.datestart} 00:00:00`,
                                end_date: `${match.competition.dateend} 23:59:59`
                            }
                        }, { new: true });
                    } else {
                        let seriesData = new seriesModel({
                            fantasy_type: 'Cricket',
                            name: match.competition.title,
                            series_key: match.competition.cid,
                            status: match.competition.status == 'live' ? 'opened' : 'closed',
                            start_date: `${match.competition.datestart} 00:00:00`,
                            end_date: `${match.competition.dateend} 23:59:59`
                        })
                        series = await seriesData.save();
                        console.log('series---------inserted--------', series._id);
                    }
                    const updateListMatch = await listMatchModel.findOneAndUpdate({ real_matchkey: match.match_id }, {
                        $set: {
                            name: match.title,
                            short_name: match.short_title,
                            team1Id: temaData1._id,
                            team2Id: temaData2._id,
                            series: series._id,
                            real_matchkey: match.match_id,
                            start_date: match.date_start_ist,
                            status: status[match.status],
                            format: format[match.format],
                            tosswinner_team: match.toss.winner != 0 ? match.toss.winner : null,
                            toss_decision: toss_decision[match.toss.decision],
                        }
                    }, { new: true });
                }
            }
        }
    }
    fetchPlayerByMatch_entity(req, res) {
        try {
          // console.log(`http://rest.entitysport.com/v2/matches/${req.params.matchkey}/squads?token=1&token=d838e55bf823bc6e6ad46ba9c71106aa`);
          axios
            .get(
              `http://rest.entitysport.com/v2/matches/${req.params.matchkey}/squads?token=1&token=d838e55bf823bc6e6ad46ba9c71106aa`
            )
            .then(async (matchData) => {
              let listmatch = await listMatchModel.findOne({
                real_matchkey: req.params.matchkey,
              });
              console.log("listmatch", listmatch);
              await this.child_fetchPlayerByMatch_entity(
                matchData.data.response,
                listmatch._id
              );
              res.redirect(`/launch-match/${listmatch._id}`);
            });
        } catch (error) {
          next(error);
        }
      }
    
    async child_fetchPlayerByMatch_entity(response, matchkey) {
        let team1Id = response.teama.team_id;
        let team2Id = response.teamb.team_id;
        let data = await Promise.all([
            this.importPlayer(team1Id, response, matchkey, 'teama'),
            this.importPlayer(team2Id, response, matchkey, 'teamb'),
        ]);
    }
    async importPlayer(teamId, response, matchkey, team) {
        let teamDAta = await teamModel.findOne({ team_key: teamId });
        if (teamDAta) {
            for (let player of response[team].squads) {
                let playerTeam = await playersModel.findOne({ players_key: player.player_id });
                let checkPlayersKey = response['players'].find(o => o.pid == player.player_id);
                let player_role = (role[checkPlayersKey.playing_role]) ? role[checkPlayersKey.playing_role] : 'allrounder';
                if (playerTeam) {
                    if (!await matchPlayersModel.findOne({ playerid: playerTeam._id, matchkey })) {
                        let matchPlayerData = new matchPlayersModel({
                            matchkey: matchkey,
                            playerid: playerTeam._id,
                            credit: playerTeam.credit,
                            name: player.name,
                            role: player_role,
                            legal_name: player.name

                        });
                        let insmatchPlayerData = await matchPlayerData.save();
                    }
                } else {
                    let playerData = new playersModel({
                        fantasy_type: 'Cricket',
                        player_name: player.name,
                        players_key: player.player_id,
                        team: teamDAta._id,
                        role: player_role,
                        fullname: player.name,
                    })
                    let insertPlayer = await playerData.save();

                    let matchPlayerData = new matchPlayersModel({
                        matchkey: matchkey,
                        playerid: insertPlayer._id,
                        credit: insertPlayer.credit,
                        name: player.name,
                        role: player_role,
                        legal_name: player.name

                    })
                    let insmatchPlayerData = await matchPlayerData.save();
                }

            }
        }
    }

    async getmatchscore(real_matchkey) {
        try {
            let matchData = await axios.get(`http://rest.entitysport.com/v2/matches/${real_matchkey}/scorecard?token=1&token=d838e55bf823bc6e6ad46ba9c71106aa`);
            return matchData.data.response;
        } catch (error) {
            next(error);
        }
    }
   
}
module.exports = new cricketApiController();