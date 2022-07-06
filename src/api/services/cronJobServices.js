const mongoose = require('mongoose');
const moment = require('moment');

const listMatchesModel = require('../../models/listMatchesModel');
const matchPlayersModel = require('../../models/matchPlayersModel');
const JoinTeamModel = require('../../models/JoinTeamModel');

class CronJob {
    constructor() {
        return {
            updatePlayerSelected: this.updatePlayerSelected.bind(this)
        }
    }

    async updatePlayerSelected(req, res, next) {
        try {
            let aggpipe = [];
            // let matchdata = await listMatchesModel.find({ start_date: moment().format("YYYY-MM-DD") }).populate({
            //     path: '_id',
            //     select: 'matchkey'
            // })
            aggpipe.push({
                $match: {
                    start_date: { $gte: moment().format("YYYY-MM-DD 00:00:00") },
                    status: 'notstarted',
                    launch_status: 'launched'
                }
            });
            aggpipe.push({
                $lookup: {
                    from: 'matchplayers',
                    let: { id: '$_id' },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $eq: ['$$id', '$matchkey']
                            }
                        }
                    }, { $project: { playerid: 1 } }],
                    as: 'allplayers'
                }
            });
            let matchdata = await listMatchesModel.aggregate(aggpipe);
            let i = 0;
            for (let match of matchdata) {
                i++;
                for (let player of match.allplayers) {
                    let [totalSelected, captainSelected, vicecaptainSelected] = await Promise.all([
                        await JoinTeamModel.find({
                            matchkey: mongoose.Types.ObjectId(match._id),
                            players: { $in: [mongoose.Types.ObjectId(player.playerid)] }
                        }).count(),
                        await JoinTeamModel.find({
                            matchkey: mongoose.Types.ObjectId(match._id),
                            captain: mongoose.Types.ObjectId(player.playerid)
                        }).count(),
                        await JoinTeamModel.find({
                            matchkey: mongoose.Types.ObjectId(match._id),
                            vicecaptain: mongoose.Types.ObjectId(player.playerid)
                        }).count()
                    ]);
                    console.log(totalSelected, '-----------', captainSelected, '------------------', vicecaptainSelected);
                    await matchPlayersModel.updateOne({ matchkey: mongoose.Types.ObjectId(match._id), playerid: mongoose.Types.ObjectId(player.playerid) }, { totalSelected, captainSelected, vicecaptainSelected });
                }
                // if (matchdata.length == i) {
                //     res.status(200).send('done');
                // }
            }
            // return res.send(matchdata);
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new CronJob();