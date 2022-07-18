const mongoose = require('mongoose');

const listMatchesModel = require('../../models/listMatchesModel');
const joinTeamsModel = require('../../models/JoinTeamModel');
const matchPlayersModel = require('../../models/matchPlayersModel');
const JoinLeaugeModel = require('../../models/JoinLeaugeModel');

class classicBotService {
    constructor() {
        return {
            autoClassicTeam: this.autoClassicTeam.bind(this),
        }
    }

    async autoClassicTeam(req) {
        try {
            const matches = await listMatchesModel.find({ status: 'started', launch_status: 'launched' });
            // const matches = await listMatchesModel.find({ _id: mongoose.Types.ObjectId('6275f58a638ae5b4ca98909b') });
            let i = 0;
            if (matches.length > 0) {
                for (let match of matches) {
                    i++;

                    let classicBotTeam = await this.classicBotTeams(match._id);

                    if (i == matches.length) {
                        return {
                            message: 'get list matches',
                            status: true,
                            data: classicBotTeam
                        }
                    }
                }
            } else {
                return {
                    message: 'no matches',
                    status: false,
                    data: {}
                }
            }
        } catch (error) {
            throw error;
        }
    }

    async generateRandomTeam(matchkey) {
        let joinTeamsPipeline = [];
        joinTeamsPipeline.push({
            $match: {
                matchkey: mongoose.Types.ObjectId(matchkey),
                player_type: "classic",
                user_type: 0
            }
        });
        const getJoinedTeams = await joinTeamsModel.aggregate(joinTeamsPipeline);

        let random = Math.floor(Math.random() * getJoinedTeams.length);
        let randomTeam;
        if (getJoinedTeams.length > 0) {
            randomTeam = getJoinedTeams[random];
        } else {
            randomTeam = {};
        }

        if (randomTeam) {
            return randomTeam;
        }
    }

    async genrateRandomPlayer(matchkey, role, randomPlayers) {
        const matchPlayerPipeline = [];
        matchPlayerPipeline.push({
            $match: {
                matchkey: mongoose.Types.ObjectId(matchkey),
                role: role,
                playerid: { $nin: randomPlayers }
            }
        });
        const matchPlayers = await matchPlayersModel.aggregate(matchPlayerPipeline);

        let random = Math.floor(Math.random() * matchPlayers.length);
        let randomPlayer = matchPlayers[random];

        if (randomPlayer && randomPlayer !== {}) {
            return randomPlayer;
        } else return;
    }

    async classicBotTeams(matchkey) {
        let joinLeaugesPipeline = [];
        joinLeaugesPipeline.push({
            $match: {
                matchkey: mongoose.Types.ObjectId(matchkey),
                team_type: 'classic',
                teamid: null,
            }
        });
        let joinedLeauges = await JoinLeaugeModel.aggregate(joinLeaugesPipeline);


        if (joinedLeauges && Array.isArray(joinedLeauges) && joinedLeauges.length == 0) {
            console.log({ message: 'no leauges!!!' })
            return { message: 'no leauges!!!' }
        }

        let count = 0;
        for (let joinedLeauge of joinedLeauges) {
            count++;
            let randomTeam = await this.generateRandomTeam(matchkey);
            if (randomTeam && randomTeam !== {}) {
                let playersOfRandomTeam = randomTeam.players;

                let random = Math.floor(Math.random() * playersOfRandomTeam.length);
                let removedRandomPlayer = playersOfRandomTeam[random];
                const removedMatchPlayers = await matchPlayersModel.findOne({ matchkey: mongoose.Types.ObjectId(matchkey), playerid: removedRandomPlayer });
                playersOfRandomTeam.splice(random, 1);
                let randomPlayer = await this.genrateRandomPlayer(matchkey, removedMatchPlayers.role, randomTeam.players);

                if (!randomPlayer) {
                    while (!playersOfRandomTeam.includes('')) {
                        randomPlayer = await this.genrateRandomPlayer(matchkey, removedMatchPlayers.role, randomTeam.players);
                    }
                }

                if (randomPlayer && randomPlayer !== {}) {
                    playersOfRandomTeam.push(randomPlayer.playerid);
                    let joinTeams = await joinTeamsModel.findOne({ userid: joinedLeauge.userid, matchkey: joinedLeauge.matchkey, player_type: 'classic' }).sort({ teamnumber: -1 });
                    let teamNumber = 1;
                    let newTeam = {};
                    if (joinTeams) {
                        teamNumber = joinTeams.teamnumber + teamNumber
                        if (teamNumber < 12) {
                            newTeam.teamnumber = teamNumber;
                        } else {
                            newTeam.teamnumber = teamNumber;
                        }
                    } else {
                        newTeam.teamnumber = teamNumber;
                    }
                    if (newTeam.teamnumber < 12) {
                        let captain = randomTeam.captain;
                        let vicecaptain = randomTeam.vicecaptain;

                        if (randomTeam.captain.toString() == removedRandomPlayer.toString()) {
                            captain = playersOfRandomTeam[playersOfRandomTeam.length - 1]
                        }
                        if (randomTeam.vicecaptain.toString() == removedRandomPlayer.toString()) {
                            vicecaptain = playersOfRandomTeam[playersOfRandomTeam.length - 1]
                        }
                        newTeam.userid = joinedLeauge.userid;
                        newTeam.matchkey = joinedLeauge.matchkey;
                        newTeam.players = playersOfRandomTeam;
                        newTeam.static_players = playersOfRandomTeam;
                        newTeam.captain = captain;
                        newTeam.vicecaptain = vicecaptain;
                        newTeam.user_type = 1;
                        newTeam.player_type = "classic";

                        let getJoinTeams = await joinTeamsModel.find({ userid: joinedLeauge.userid, matchkey: joinedLeauge.matchkey, player_type: 'classic' });
                        if (getJoinTeams.length > 0) {
                            for (let joinTeam of getJoinTeams) {
                                if (joinTeam.captain.toString() == randomTeam.captain.toString() && joinTeam.vicecaptain.toString() == randomTeam.vicecaptain.toString()) {
                                    // await this.generateRandomTeam(matchkey);
                                    continue;
                                }
                                let bLastTeamPlayers = [];
                                let bRandTeamplayers = [];

                                for (let i of joinTeam.players) {
                                    bLastTeamPlayers.push(i.toString());
                                }
                                for (let i of playersOfRandomTeam) {
                                    bRandTeamplayers.push(i.toString());
                                }

                                if (JSON.stringify(bLastTeamPlayers) == JSON.stringify(bRandTeamplayers)) {
                                    // await this.generateRandomTeam(matchkey);
                                    continue;
                                }
                            }
                        }
                        let checkJoinTeam = await joinTeamsModel.findOne({ userid: joinedLeauge.userid, matchkey: joinedLeauge.matchkey, player_type: 'classic', teamnumber: newTeam.teamNumber });
                        if (checkJoinTeam == null) {
                            if (joinedLeauge._id) {
                                let addNewTeam = await joinTeamsModel.create(newTeam);
                                await JoinLeaugeModel.updateOne({ _id: mongoose.Types.ObjectId(joinedLeauge._id) }, { teamid: addNewTeam._id }, { new: true });
                            }
                        }

                    } else {
                        let getJoinTeams = await joinTeamsModel.find({ userid: joinedLeauge.userid, matchkey: joinedLeauge.matchkey, player_type: 'classic' });
                        if (getJoinTeams.length > 0) {
                            for (let joinTeam of getJoinTeams) {
                                let aggpipe = [];
                                aggpipe.push({
                                    $match: {
                                        matchkey: mongoose.Types.ObjectId(joinedLeauge.matchkey),
                                        challengeid: mongoose.Types.ObjectId(joinedLeauge.challengeid),
                                        teamid: mongoose.Types.ObjectId(joinTeam._id)
                                    }
                                });
                                aggpipe.push({
                                    $lookup: {
                                        from: 'matchchallenges',
                                        localField: 'challengeid',
                                        foreignField: '_id',
                                        as: 'challenge_data'
                                    }
                                });
                                aggpipe.push({
                                    $unwind: {
                                        path: '$challenge_data'
                                    }
                                });
                                aggpipe.push({
                                    $addFields: {
                                        multi_entry: '$challenge_data.multi_entry'
                                    }
                                });
                                aggpipe.push({
                                    $project: {
                                        challenge_data: 0
                                    }
                                });
                                let joinedLeaugeTeams = await JoinLeaugeModel.aggregate(aggpipe);
                                if (joinedLeaugeTeams.length == 0) {
                                    await JoinLeaugeModel.updateOne({ _id: mongoose.Types.ObjectId(joinedLeauge._id) }, { teamid: joinTeam._id }, { new: true });
                                    continue;
                                }
                            }
                        }
                    }
                } else {
                    console.log({ message: 'no available player found!!!' });
                    continue;
                }
            } else {
                console.log({ message: 'no available team found!!!' });
                continue;
            }
        }
        console.log('----- total count -->', count);
        return { message: 'leauges joined successfully!!!' };
    }

}

module.exports = new classicBotService();