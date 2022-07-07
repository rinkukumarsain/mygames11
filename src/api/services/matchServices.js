const mongoose = require('mongoose');
const randomstring = require("randomstring");
const moment = require('moment');


require('../../models/challengersModel');
require('../../models/playerModel');
require('../../models/teamModel');
const matchchallengesModel = require('../../models/matchChallengersModel');
const listMatchesModel = require('../../models/listMatchesModel');
const SeriesModel = require('../../models/addSeriesModel');
const matchPlayersModel = require('../../models/matchPlayersModel');
const JoinLeaugeModel = require('../../models/JoinLeaugeModel');
const JoinTeamModel = require('../../models/JoinTeamModel');
const matchrunModel = require('../../models/matchRunModel');
const EntityApiController = require('../../admin/controller/cricketApiController');

const constant = require('../../config/const_credential');
const NOTIFICATION_TEXT = require('../../config/notification_text');

class matchServices {
    constructor() {
        return {
            getAllSeries: this.getAllSeries.bind(this),
            getMatchList: this.getMatchList.bind(this),
            Newjoinedmatches: this.Newjoinedmatches.bind(this),
            latestJoinedMatches: this.latestJoinedMatches.bind(this),
            getMatchDetails: this.getMatchDetails.bind(this),
            getallplayers: this.getallplayers.bind(this),
            getPlayerInfo: this.getPlayerInfo.bind(this),
            createMyTeam: this.createMyTeam.bind(this),
            getMyTeams: this.getMyTeams.bind(this),
            viewTeam: this.viewTeam.bind(this),
            getMatchTime: this.getMatchTime.bind(this),
            AllCompletedMatches: this.AllCompletedMatches.bind(this),
            getLiveScores: this.getLiveScores.bind(this),
            liveRanksLeaderboard: this.liveRanksLeaderboard.bind(this),
            fantasyScoreCards: this.fantasyScoreCards.bind(this),
            matchlivedata: this.matchlivedata.bind(this)
        }
    }

    /**
     * @function getAllSeries
     * @description Get All Matches
     * @param { }
     * @author Devanshu Gautam
     */
    async getAllSeries(req) {
        try {
            const series = await SeriesModel.find({
                status: constant.SERIES_STATUS.OPENED,
                end_date: { $gte: moment().format('YYYY-MM-DD HH:mm:ss') },
            }, { _id: 1, name: 1, start_date: 1, end_date: 1, status: 1 }).sort({ end_date: -1 });
            if (series.length == 0) {
                return {
                    message: 'Sorry,no data available!',
                    status: true,
                    data: []
                }
            }
            console.log('series------------', series);
            let arr = [];
            for (let item of series) {
                let obj = {
                    id: item._id,
                    name: item.name,
                    status: 1,
                    startdate: moment(item.start_date).format('DD MMM YYYY'),
                    starttime: moment(item.start_date).format('h:mm a'),
                    enddate: moment(item.end_date).format('DD MMM YYYY'),
                    endtime: moment(item.end_date).format('h:mm a'),
                    startdatetime: moment(item.start_date).format('YYYY-MM-DD h:mm:ss'),
                    enddatetime: moment(item.end_date).format('YYYY-MM-DD h:mm:ss')
                }
                arr.push(obj);
            }
            if (series.length == arr.length) {
                return {
                    message: 'Series Data...!',
                    status: true,
                    data: arr
                }
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function getMatchList
     * @description Get All Match List
     * @param { }
     * @author Devanshu Gautam
     */
    async getMatchList() {
        try {
            let matchpipe = [];
            let date = moment().format('YYYY-MM-DD HH:mm:ss');
            console.log(`date`, date);
            let EndDate = moment().add(25, 'days').format('YYYY-MM-DD HH:mm:ss');
            matchpipe.push({
                $match: {
                    $and: [{ status: 'notstarted' }, { launch_status: 'launched' }, { start_date: { $gt: date } }, { start_date: { $lt: EndDate } }],
                    final_status: { $nin: ['IsCanceled', 'IsAbandoned'] }
                }
            });
            matchpipe.push({
                $lookup: { from: 'teams', localField: 'team1Id', foreignField: '_id', as: 'team1' }
            });
            matchpipe.push({
                $lookup: { from: 'teams', localField: 'team2Id', foreignField: '_id', as: 'team2' }
            });
            matchpipe.push({
                $lookup: { from: 'series', localField: 'series', foreignField: '_id', as: 'series' }
            });
            matchpipe.push({
                $match: { 'series.status': 'opened' }
            });
            matchpipe.push({
                $sort: {
                    start_date: 1,
                },
            });
            matchpipe.push({
                $project: {
                    _id: 0,
                    id: '$_id',
                    name: 1,
                    format: 1,
                    order_status: 1,
                    series: { $arrayElemAt: ['$series._id', 0] },
                    seriesname: { $arrayElemAt: ['$series.name', 0] },
                    team1name: { $toUpper: { $arrayElemAt: ['$team1.short_name', 0] } },
                    team2name: { $toUpper: { $arrayElemAt: ['$team2.short_name', 0] } },
                    teamfullname1: { $toUpper: { $arrayElemAt: ['$team1.teamName', 0] } },
                    teamfullname2: { $toUpper: { $arrayElemAt: ['$team2.teamName', 0] } },
                    matchkey: 1,
                    type: '$fantasy_type',
                    winnerstatus: '$final_status',
                    playing11_status: 1,
                    team1color: { $ifNull: [{ $arrayElemAt: ['$team1.color', 0] }, constant.TEAM_DEFAULT_COLOR.DEF1] },
                    team2color: { $ifNull: [{ $arrayElemAt: ['$team2.color', 0] }, constant.TEAM_DEFAULT_COLOR.DEF1] },
                    team1logo: {
                        $ifNull: [{
                            $cond: {
                                if: { $or: [{ $eq: [{ $substr: [{ $arrayElemAt: ['$team1.logo', 0] }, 0, 1] }, '/'] }, { $eq: [{ $substr: [{ $arrayElemAt: ['$team1.logo', 0] }, 0, 1] }, 't'] }] },
                                then: { $concat: [`${constant.BASE_URL}`, '', { $arrayElemAt: ['$team1.logo', 0] }] },
                                else: { $arrayElemAt: ['$team1.logo', 0] },
                            }
                        }, `${constant.BASE_URL}team_image.png`]
                    },
                    team2logo: {
                        $ifNull: [{
                            $cond: {
                                if: { $or: [{ $eq: [{ $substr: [{ $arrayElemAt: ['$team2.logo', 0] }, 0, 1] }, '/'] }, { $eq: [{ $substr: [{ $arrayElemAt: ['$team2.logo', 0] }, 0, 1] }, 't'] }] },
                                then: { $concat: [`${constant.BASE_URL}`, '', { $arrayElemAt: ['$team2.logo', 0] }] },
                                else: { $arrayElemAt: ['$team2.logo', 0] },
                            }
                        }, `${constant.BASE_URL}team_image.png`]
                    },
                    matchopenstatus: {
                        $cond: {
                            if: { $lte: ['$start_date', moment().format('YYYY-MM-DD HH:mm:ss')] },
                            then: 'closed',
                            else: 'opened',
                        },
                    },
                    time_start: '$start_date',
                    launch_status: 1,
                    locktime: EndDate,
                    createteamnumber: '1',
                    status: 'true',
                },
            });
            const result = await listMatchesModel.aggregate(matchpipe);
            if (result.length > 0) return result
            else return [];
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function latestJoinedMatches
     * @description show all type of joined matches(upcoming, live, completed)
     * @param { }
     * @author Devanshu Gautam
     */
    async latestJoinedMatches(req) {
        const aggPipe = [];
        aggPipe.push({
            $match: {
                userid: mongoose.Types.ObjectId(req.user._id),
            },
        });
        aggPipe.push({
            $group: {
                _id: '$matchkey',
                matchkey: { $first: '$matchkey' },
                joinedleaugeId: { $first: '$_id' },
                userid: { $first: '$userid' },
                matchchallengeid: { $first: '$challengeid' },
                jointeamid: { $first: '$teamid' },
            },
        });
        aggPipe.push({
            $lookup: {
                from: 'listmatches',
                localField: 'matchkey',
                foreignField: '_id',
                as: 'match',
            },
        });
        aggPipe.push({
            $unwind: {
                path: '$match',
            },
        });
        // aggPipe.push({
        //     $match: {
        //         $or: [{ 'match.final_status': 'pending' }, { 'match.final_status': 'IsReviewed' }],
        //     },
        // });
        // aggPipe.push({
        //     $sort: {
        //         'match.start_date': -1,
        //     },
        // });
        aggPipe.push({
            $limit: 5,
        });
        aggPipe.push({
            $lookup: {
                from: 'joinedleauges',
                let: { matchkey: '$matchkey', userid: '$userid' },
                pipeline: [{
                    $match: {
                        $expr: {
                            $and: [{
                                    $eq: ['$matchkey', '$$matchkey'],
                                },
                                {
                                    $eq: ['$userid', '$$userid'],
                                },
                            ],
                        },
                    },
                }, ],
                as: 'joinedleauges',
            },
        });
        aggPipe.push({
            $unwind: {
                path: '$joinedleauges',
            },
        });
        aggPipe.push({
            $group: {
                _id: '$joinedleauges.challengeid',
                // matchchallengeid: { $first: '$joinedleauges.challengeid' },
                joinedleaugeId: { $first: '$joinedleauges._id' },
                matchkey: { $first: '$matchkey' },
                jointeamid: { $first: '$jointeamid' },
                userid: { $first: '$userid' },
                match: { $first: '$match' },
            },
        });
        // aggPipe.push({
        //     $lookup: {
        //         from: 'matchchallenges',
        //         localField: '_id',
        //         foreignField: '_id',
        //         as: 'matchchallenge',
        //     },
        // });
        // aggPipe.push({
        //     $unwind: {
        //         path: '$matchchallenge',
        //         preserveNullAndEmptyArrays: true,
        //     },
        // });
        aggPipe.push({
            $group: {
                _id: '$matchkey',
                joinedleaugeId: { $first: '$joinedleaugeId' },
                matchkey: { $first: '$matchkey' },
                jointeamid: { $first: '$jointeamid' },
                match: { $first: '$match' },
                count: { $sum: 1 },
            },
        });
        aggPipe.push({
            $lookup: {
                from: 'series',
                localField: 'match.series',
                foreignField: '_id',
                as: 'series',
            },
        });
        aggPipe.push({
            $lookup: {
                from: 'teams',
                localField: 'match.team1Id',
                foreignField: '_id',
                as: 'team1',
            },
        });
        aggPipe.push({
            $lookup: {
                from: 'teams',
                localField: 'match.team2Id',
                foreignField: '_id',
                as: 'team2',
            },
        });
        aggPipe.push({
            $unwind: {
                path: '$series',
            },
        });
        aggPipe.push({
            $unwind: {
                path: '$team1',
            },
        });
        aggPipe.push({
            $unwind: {
                path: '$team2',
            },
        });
        aggPipe.push({
            $project: {
                _id: 0,
                matchkey: 1,
                matchname: { $ifNull: ['$match.name', ''] },
                team1ShortName: { $ifNull: ['$team1.short_name', ''] },
                team2ShortName: { $ifNull: ['$team2.short_name', ''] },
                team1color: { $ifNull: ['$team1.color', constant.TEAM_DEFAULT_COLOR.DEF1] },
                team2color: { $ifNull: ['$team2.color', constant.TEAM_DEFAULT_COLOR.DEF1] },
                team1logo: {
                    $ifNull: [{
                        $cond: {
                            if: { $or: [{ $eq: [{ $substr: ['$team1.logo', 0, 1] }, '/'] }, { $eq: [{ $substr: ['$team1.logo', 0, 1] }, 't'] }] },
                            then: { $concat: [`${constant.BASE_URL}`, '', '$team1.logo'] },
                            else: '$team1.logo',
                        }
                    }, `${constant.BASE_URL}team_image.png`]
                },
                team2logo: {
                    $ifNull: [{
                        $cond: {
                            if: { $or: [{ $eq: [{ $substr: ['$team2.logo', 0, 1] }, '/'] }, { $eq: [{ $substr: ['$team2.logo', 0, 1] }, 't'] }] },
                            then: { $concat: [`${constant.BASE_URL}`, '', '$team2.logo'] },
                            else: '$team2.logo',
                        }
                    }, `${constant.BASE_URL}team_image.png`]
                },
                start_date: { $ifNull: ['$match.start_date', '0000-00-00 00:00:00'] },
                status: {
                    $ifNull: [{
                            $cond: {
                                if: { $lt: ['$match.start_date', moment().format('YYYY-MM-DD HH:mm:ss')] },
                                then: 'closed',
                                else: 'opened',
                            },
                        },
                        'opened',
                    ],
                },
                launch_status: { $ifNull: ['$match.launch_status', ''] },
                final_status: { $ifNull: ['$match.final_status', ''] },
                series_name: { $ifNull: ['$series.name', ''] },
                type: { $ifNull: ['$match.fantasy_type', 'Cricket'] },
                series_id: { $ifNull: ['$series._id', ''] },
                available_status: { $ifNull: [1, 1] },
                joinedcontest: { $ifNull: ['$count', 0] },
            }
        });
        const JoiendMatches = await JoinLeaugeModel.aggregate(aggPipe);
        return JoiendMatches;
    }

    /**
     * @function Newjoinedmatches
     * @description User Joiend latest 5 Upcoming and live match
     * @param { }
     * @author Devanshu Gautam
     */
    async Newjoinedmatches(req) {
        const aggPipe = [];
        aggPipe.push({
            $match: {
                userid: mongoose.Types.ObjectId(req.user._id),
            },
        });
        aggPipe.push({
            $group: {
                _id: '$matchkey',
                matchkey: { $first: '$matchkey' },
                joinedleaugeId: { $first: '$_id' },
                userid: { $first: '$userid' },
                matchchallengeid: { $first: '$challengeid' },
                jointeamid: { $first: '$teamid' },
            },
        });
        aggPipe.push({
            $lookup: {
                from: 'listmatches',
                localField: 'matchkey',
                foreignField: '_id',
                as: 'match',
            },
        });
        aggPipe.push({
            $unwind: {
                path: '$match',
            },
        });
        aggPipe.push({
            $match: {
                $or: [{ 'match.final_status': 'pending' }, { 'match.final_status': 'IsReviewed' }],
            },
        });
        // aggPipe.push({
        //     $sort: {
        //         'match.start_date': -1,
        //     },
        // });
        aggPipe.push({
            $limit: 5,
        });
        aggPipe.push({
            $lookup: {
                from: 'joinedleauges',
                let: { matchkey: '$matchkey', userid: '$userid' },
                pipeline: [{
                    $match: {
                        $expr: {
                            $and: [{
                                    $eq: ['$matchkey', '$$matchkey'],
                                },
                                {
                                    $eq: ['$userid', '$$userid'],
                                },
                            ],
                        },
                    },
                }, ],
                as: 'joinedleauges',
            },
        });
        aggPipe.push({
            $unwind: {
                path: '$joinedleauges',
            },
        });
        aggPipe.push({
            $group: {
                _id: '$joinedleauges.challengeid',
                // matchchallengeid: { $first: '$joinedleauges.challengeid' },
                joinedleaugeId: { $first: '$joinedleauges._id' },
                matchkey: { $first: '$matchkey' },
                jointeamid: { $first: '$jointeamid' },
                userid: { $first: '$userid' },
                match: { $first: '$match' },
            },
        });
        // aggPipe.push({
        //     $lookup: {
        //         from: 'matchchallenges',
        //         localField: '_id',
        //         foreignField: '_id',
        //         as: 'matchchallenge',
        //     },
        // });
        // aggPipe.push({
        //     $unwind: {
        //         path: '$matchchallenge',
        //         preserveNullAndEmptyArrays: true,
        //     },
        // });
        aggPipe.push({
            $group: {
                _id: '$matchkey',
                joinedleaugeId: { $first: '$joinedleaugeId' },
                matchkey: { $first: '$matchkey' },
                jointeamid: { $first: '$jointeamid' },
                match: { $first: '$match' },
                count: { $sum: 1 },
            },
        });
        aggPipe.push({
            $lookup: {
                from: 'series',
                localField: 'match.series',
                foreignField: '_id',
                as: 'series',
            },
        });
        aggPipe.push({
            $lookup: {
                from: 'teams',
                localField: 'match.team1Id',
                foreignField: '_id',
                as: 'team1',
            },
        });
        aggPipe.push({
            $lookup: {
                from: 'teams',
                localField: 'match.team2Id',
                foreignField: '_id',
                as: 'team2',
            },
        });
        aggPipe.push({
            $unwind: {
                path: '$series',
            },
        });
        aggPipe.push({
            $unwind: {
                path: '$team1',
            },
        });
        aggPipe.push({
            $unwind: {
                path: '$team2',
            },
        });
        aggPipe.push({
            $project: {
                _id: 0,
                matchkey: 1,
                matchname: { $ifNull: ['$match.name', ''] },
                team1ShortName: { $ifNull: ['$team1.short_name', ''] },
                team2ShortName: { $ifNull: ['$team2.short_name', ''] },
                team1color: { $ifNull: ['$team1.color', constant.TEAM_DEFAULT_COLOR.DEF1] },
                team2color: { $ifNull: ['$team2.color', constant.TEAM_DEFAULT_COLOR.DEF1] },
                team1logo: {
                    $ifNull: [{
                        $cond: {
                            if: { $or: [{ $eq: [{ $substr: ['$team1.logo', 0, 1] }, '/'] }, { $eq: [{ $substr: ['$team1.logo', 0, 1] }, 't'] }] },
                            then: { $concat: [`${constant.BASE_URL}`, '', '$team1.logo'] },
                            else: '$team1.logo',
                        }
                    }, `${constant.BASE_URL}team_image.png`]
                },
                team2logo: {
                    $ifNull: [{
                        $cond: {
                            if: { $or: [{ $eq: [{ $substr: ['$team2.logo', 0, 1] }, '/'] }, { $eq: [{ $substr: ['$team2.logo', 0, 1] }, 't'] }] },
                            then: { $concat: [`${constant.BASE_URL}`, '', '$team2.logo'] },
                            else: '$team2.logo',
                        }
                    }, `${constant.BASE_URL}team_image.png`]
                },
                start_date: { $ifNull: ['$match.start_date', '0000-00-00 00:00:00'] },
                status: {
                    $ifNull: [{
                            $cond: {
                                if: { $lt: ['$match.start_date', moment().format('YYYY-MM-DD HH:mm:ss')] },
                                then: 'closed',
                                else: 'opened',
                            },
                        },
                        'opened',
                    ],
                },
                launch_status: { $ifNull: ['$match.launch_status', ''] },
                final_status: { $ifNull: ['$match.final_status', ''] },
                series_name: { $ifNull: ['$series.name', ''] },
                type: { $ifNull: ['$match.fantasy_type', 'Cricket'] },
                series_id: { $ifNull: ['$series._id', ''] },
                available_status: { $ifNull: [1, 1] },
                joinedcontest: { $ifNull: ['$count', 0] },
            }
        });
        const JoiendMatches = await JoinLeaugeModel.aggregate(aggPipe);
        if (JoiendMatches.length > 0) {
            return {
                message: 'User Joiend latest 5 Upcoming and live match data..',
                status: true,
                data: JoiendMatches
            };
        } else {
            return {
                message: 'No Data Found..',
                status: false,
                data: []
            };
        }
    }

    /**
     * @function AllCompletedMatches
     * @description User Joiend all completed matches shows
     * @param { }
     * @author Devanshu Gautam
     */
    async AllCompletedMatches(req) {
        try {
            const aggPipe = [];
            aggPipe.push({
                $match: {
                    userid: mongoose.Types.ObjectId(req.user._id),
                },
            });
            aggPipe.push({
                $group: {
                    _id: '$matchkey',
                    matchkey: { $first: '$matchkey' },
                    joinedleaugeId: { $first: '$_id' },
                    userid: { $first: '$userid' },
                    matchchallengeid: { $first: '$challengeid' },
                    jointeamid: { $first: '$teamid' },
                }
            });
            aggPipe.push({
                $lookup: {
                    from: 'listmatches',
                    localField: 'matchkey',
                    foreignField: '_id',
                    as: 'match',
                },
            });
            aggPipe.push({
                $unwind: {
                    path: '$match',
                },
            });
            aggPipe.push({
                $match: { 'match.final_status': 'winnerdeclared' },
            });
            aggPipe.push({
                $sort: {
                    'match.start_date': -1,
                },
            });
            aggPipe.push({
                $lookup: {
                    from: 'finalresults',
                    let: { matchkey: '$matchkey' },
                    pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$$matchkey', '$matchkey'] },
                                        { $eq: ['$userid', mongoose.Types.ObjectId(req.user._id)] },
                                    ],
                                },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                amount: { $sum: '$amount' },
                            },
                        },
                    ],
                    as: 'finalresultsTotalAmount',
                },
            });
            aggPipe.push({
                $unwind: { path: '$finalresultsTotalAmount' }
            });
            aggPipe.push({
                $lookup: {
                    from: 'joinedleauges',
                    let: { matchkey: '$matchkey', userid: '$userid' },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [{
                                        $eq: ['$matchkey', '$$matchkey'],
                                    },
                                    {
                                        $eq: ['$userid', '$$userid'],
                                    },
                                ],
                            },
                        },
                    }, ],
                    as: 'joinedleauges',
                },
            });
            aggPipe.push({
                $unwind: {
                    path: '$joinedleauges',
                },
            });
            aggPipe.push({
                $group: {
                    _id: '$joinedleauges.challengeid',
                    joinedleaugeId: { $first: '$joinedleauges._id' },
                    matchkey: { $first: '$matchkey' },
                    jointeamid: { $first: '$jointeamid' },
                    match: { $first: '$match' },
                    finalresultsTotalAmount: { $first: '$finalresultsTotalAmount' }
                },
            });
            aggPipe.push({
                $lookup: {
                    from: 'matchchallenges',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'matchchallenge',
                },
            });
            aggPipe.push({
                $unwind: {
                    path: '$matchchallenge',
                    preserveNullAndEmptyArrays: true,
                },
            });
            aggPipe.push({
                $group: {
                    _id: '$matchkey',
                    joinedleaugeId: { $first: '$joinedleaugeId' },
                    matchkey: { $first: '$matchkey' },
                    jointeamid: { $first: '$jointeamid' },
                    match: { $first: '$match' },
                    finalresultsTotalAmount: { $first: '$finalresultsTotalAmount' },
                    count: { $sum: 1 },
                },
            });
            aggPipe.push({
                $lookup: {
                    from: 'series',
                    localField: 'match.series',
                    foreignField: '_id',
                    as: 'series',
                },
            });
            aggPipe.push({
                $lookup: {
                    from: 'teams',
                    localField: 'match.team1Id',
                    foreignField: '_id',
                    as: 'team1',
                },
            });
            aggPipe.push({
                $lookup: {
                    from: 'teams',
                    localField: 'match.team2Id',
                    foreignField: '_id',
                    as: 'team2',
                },
            });
            aggPipe.push({
                $unwind: {
                    path: '$series',
                },
            });
            aggPipe.push({
                $unwind: {
                    path: '$team1',
                },
            });
            aggPipe.push({
                $unwind: {
                    path: '$team2',
                },
            });
            aggPipe.push({
                $project: {
                    _id: 0,
                    matchkey: 1,
                    matchname: { $ifNull: ['$match.name', ''] },
                    team1ShortName: { $ifNull: ['$team1.short_name', ''] },
                    team2ShortName: { $ifNull: ['$team2.short_name', ''] },
                    team1color: { $ifNull: ['$team1.color', constant.TEAM_DEFAULT_COLOR.DEF1] },
                    team2color: { $ifNull: ['$team2.color', constant.TEAM_DEFAULT_COLOR.DEF1] },
                    team1logo: {
                        $ifNull: [{
                            $cond: {
                                if: { $or: [{ $eq: [{ $substr: ['$team1.logo', 0, 1] }, '/'] }, { $eq: [{ $substr: ['$team1.logo', 0, 1] }, 't'] }] },
                                then: { $concat: [`${constant.BASE_URL}`, '', '$team1.logo'] },
                                else: '$team1.logo',
                            }
                        }, `${constant.BASE_URL}team_image.png`]
                    },
                    team2logo: {
                        $ifNull: [{
                            $cond: {
                                if: { $or: [{ $eq: [{ $substr: ['$team2.logo', 0, 1] }, '/'] }, { $eq: [{ $substr: ['$team2.logo', 0, 1] }, 't'] }] },
                                then: { $concat: [`${constant.BASE_URL}`, '', '$team2.logo'] },
                                else: '$team2.logo',
                            }
                        }, `${constant.BASE_URL}team_image.png`]
                    },
                    start_date: { $ifNull: ['$match.start_date', '0000-00-00 00:00:00'] },
                    status: {
                        $ifNull: [{
                                $cond: {
                                    if: { $lt: ['$match.start_date', moment().format('YYYY-MM-DD HH:mm:ss')] },
                                    then: 'closed',
                                    else: 'opened',
                                },
                            },
                            'opened',
                        ],
                    },
                    totalWinningAmount: { $ifNull: ['$finalresultsTotalAmount.amount', 0] },
                    launch_status: { $ifNull: ['$match.launch_status', ''] },
                    final_status: { $ifNull: ['$match.final_status', ''] },
                    series_name: { $ifNull: ['$series.name', ''] },
                    type: { $ifNull: ['$match.fantasy_type', 'Cricket'] },
                    series_id: { $ifNull: ['$series._id', ''] },
                    available_status: { $ifNull: [1, 1] },
                    joinedcontest: { $ifNull: ['$count', 0] },
                }
            });
            const JoiendMatches = await JoinLeaugeModel.aggregate(aggPipe);
            if (JoiendMatches.length > 0) {
                return {
                    message: 'User Joiend All Completed Matches Data..',
                    status: true,
                    data: JoiendMatches
                };
            } else {
                return {
                    message: 'No Data Found..',
                    status: false,
                    data: []
                };
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function getMatchDetails
     * @description Give matches detailed listing
     * @param { matchkey }
     * @author Devanshu Gautam
     */
    async getMatchDetails(req) {
        try {
            // console.log(`req.params.matchId`, req.params.matchId);
            const matchPipe = [];
            matchPipe.push({
                $match: { _id: mongoose.Types.ObjectId(req.params.matchId) }
            });
            matchPipe.push({
                $lookup: {
                    from: 'series',
                    localField: 'series',
                    foreignField: '_id',
                    as: 'series'
                }
            });
            matchPipe.push({
                $lookup: {
                    from: 'teams',
                    localField: 'team1Id',
                    foreignField: '_id',
                    as: 'team1'
                }
            });
            matchPipe.push({
                $lookup: {
                    from: 'teams',
                    localField: 'team2Id',
                    foreignField: '_id',
                    as: 'team2'
                }
            });
            matchPipe.push({
                $project: {
                    _id: 0,
                    id: '$_id',
                    name: 1,
                    format: 1,
                    order_status: 1,
                    series: { $arrayElemAt: ['$series._id', 0] },
                    seriesname: { $arrayElemAt: ['$series.name', 0] },
                    team1name: { $toUpper: { $arrayElemAt: ['$team1.short_name', 0] } },
                    team2name: { $toUpper: { $arrayElemAt: ['$team2.short_name', 0] } },
                    teamfullname1: { $toUpper: { $arrayElemAt: ['$team1.teamName', 0] } },
                    teamfullname2: { $toUpper: { $arrayElemAt: ['$team2.teamName', 0] } },
                    matchkey: 1,
                    type: '$fantasy_type',
                    winnerstatus: '$final_status',
                    playing11_status: 1,
                    team1color: { $ifNull: [{ $arrayElemAt: ['$team1.color', 0] }, constant.TEAM_DEFAULT_COLOR.DEF1] },
                    team2color: { $ifNull: [{ $arrayElemAt: ['$team2.color', 0] }, constant.TEAM_DEFAULT_COLOR.DEF1] },
                    team1logo: {
                        $ifNull: [{
                            $cond: {
                                if: { $or: [{ $eq: [{ $substr: [{ $arrayElemAt: ['$team1.logo', 0] }, 0, 1] }, '/'] }, { $eq: [{ $substr: [{ $arrayElemAt: ['$team1.logo', 0] }, 0, 1] }, 't'] }] },
                                then: { $concat: [`${constant.BASE_URL}`, '', { $arrayElemAt: ['$team1.logo', 0] }] },
                                else: { $arrayElemAt: ['$team1.logo', 0] },
                            }
                        }, `${constant.BASE_URL}team_image.png`]
                    },
                    team2logo: {
                        $ifNull: [{
                            $cond: {
                                if: { $or: [{ $eq: [{ $substr: [{ $arrayElemAt: ['$team2.logo', 0] }, 0, 1] }, '/'] }, { $eq: [{ $substr: [{ $arrayElemAt: ['$team2.logo', 0] }, 0, 1] }, 't'] }] },
                                then: { $concat: [`${constant.BASE_URL}`, '', { $arrayElemAt: ['$team2.logo', 0] }] },
                                else: { $arrayElemAt: ['$team2.logo', 0] },
                            }
                        }, `${constant.BASE_URL}team_image.png`]
                    },
                    time_start: '$start_date',
                    matchstatus: {
                        $cond: {
                            if: { $ne: ['$status', 'notstarted'] },
                            then: {
                                $cond: {
                                    if: { $eq: ['$status', 'started'] },
                                    then: '$status',
                                    else: '$final_status'
                                }
                            },
                            else: {
                                $cond: {
                                    if: { $lte: ['$start_date', moment().format('YYYY-MM-DD HH:mm:ss')] },
                                    then: 'started',
                                    else: 'notstarted',
                                }
                            }
                        }
                    },
                    // totalcontest: {
                    //     $size: {
                    //         $filter: {
                    //             input: '$matchchallenges',
                    //             as: 'challange',
                    //             cond: { $eq: ['$$challange.status', 'opened'] },
                    //         },
                    //     },
                    // },
                    launch_status: 1,
                },
            });
            const result = await listMatchesModel.aggregate(matchPipe);
            if (result.length > 0) {
                return {
                    message: 'Details of a perticular match',
                    status: true,
                    data: result
                }
            } else {
                return {
                    message: 'Not Able To Find Details of a perticular match.....!',
                    status: false,
                    data: []
                }
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function getallplayers
     * @description  Get Match All Players 
     * @param { matchkey }
     * @author Devanshu Gautam
     */
    async getallplayers(req) {
        try {
            let playerPipe = [];
            playerPipe.push({
                $match: { matchkey: mongoose.Types.ObjectId(req.params.matchId) }
            });
            playerPipe.push({
                $lookup: {
                    from: 'players',
                    localField: 'playerid',
                    foreignField: '_id',
                    as: 'playersData'
                }
            });
            playerPipe.push({
                $lookup: {
                    from: 'listmatches',
                    localField: 'matchkey',
                    foreignField: '_id',
                    as: 'listmatches'
                }
            });
            playerPipe.push({
                $unwind: { path: "$playersData" }
            });
            playerPipe.push({
                $unwind: { path: "$listmatches" }
            });
            playerPipe.push({
                $lookup: {
                    from: `teams`,
                    localField: 'playersData.team',
                    foreignField: '_id',
                    as: 'team'
                }
            });
            playerPipe.push({
                    $project: {
                        _id: 0,
                        id: '$_id',
                        playerid: 1,
                        points: 1,
                        role: 1,
                        credit: 1,
                        name: 1,
                        playingstatus: 1,
                        vplaying: 1,
                        players_key: '$playersData.players_key',
                        image: {
                            $ifNull: [{
                                $cond: {
                                    if: { $or: [{ $eq: [{ $substr: ['$playersData.image', 0, 1] }, '/'] }, { $eq: [{ $substr: ['$playersData.image', 0, 1] }, 'p'] }] },
                                    then: { $concat: [`${constant.BASE_URL}`, '', '$playersData.image'] },
                                    else: {
                                        $cond: {
                                            if: { $eq: ['$playersData.image', ''] },
                                            then: `${constant.BASE_URL}player.png`,
                                            else: '$playersData.image'
                                        }
                                    }
                                }
                            }, `${constant.BASE_URL}player.png`]
                        },
                        teamName: { $toUpper: { $arrayElemAt: ['$team.teamName', 0] } },
                        teamcolor: { $ifNull: [{ $arrayElemAt: ['$team.color', 0] }, constant.TEAM_DEFAULT_COLOR.DEF1] },
                        team_logo: {
                            $ifNull: [{
                                $cond: {
                                    if: { $or: [{ $eq: [{ $substr: [{ $arrayElemAt: ['$team.logo', 0] }, 0, 1] }, '/'] }, { $eq: [{ $substr: [{ $arrayElemAt: ['$team.logo', 0] }, 0, 1] }, 't'] }] },
                                    then: { $concat: [`${constant.BASE_URL}`, '', { $arrayElemAt: ['$team.logo', 0] }] },
                                    else: { $arrayElemAt: ['$team.logo', 0] },
                                }
                            }, `${constant.BASE_URL}team_image.png`]
                        },
                        team_short_name: { $arrayElemAt: ['$team.short_name', 0] },
                        totalpoints: '0',
                        team: {
                            $cond: {
                                if: { $eq: ['$playersData.team', '$listmatches.team1Id'] },
                                then: 'team1',
                                else: {
                                    $cond: {
                                        if: { $eq: ['$playersData.team', '$listmatches.team2Id'] },
                                        then: 'team2',
                                        else: ''
                                    }
                                }
                            }
                        },
                        captain_selection_percentage: '0',
                        vice_captain_selection_percentage: '0',
                        player_selection_percentage: '0'
                    }
                })
                // console.log(`playerPipe`, playerPipe);
            let data = await matchPlayersModel.aggregate(playerPipe);
            if (data.length > 0) return {
                message: 'Players List By Match',
                status: true,
                data
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function getPlayerInfo
     * @description  Get a player Information
     * @param { matchkey,playerid }
     * @author Devanshu Gautam
     */
    async getPlayerInfo(req) {
        try {
            // console.log(`req.params.matchplayerId`, req.params.matchplayerId);
            let playerPipe = [];
            playerPipe.push({
                $match: { _id: mongoose.Types.ObjectId(req.params.matchplayerId) }
            });
            playerPipe.push({
                $lookup: {
                    from: 'listmatches',
                    localField: 'matchkey',
                    foreignField: '_id',
                    as: 'listmatches'
                }
            });
            playerPipe.push({
                $lookup: {
                    from: 'listmatches',
                    localField: 'listmatches.series',
                    foreignField: 'series',
                    as: 'allMatches'
                }
            });
            playerPipe.push({
                $lookup: {
                    from: 'players',
                    localField: 'playerid',
                    foreignField: '_id',
                    as: 'playersData'
                }
            });
            playerPipe.push({
                $unwind: { path: "$playersData" }
            });
            playerPipe.push({
                $lookup: {
                    from: `teams`,
                    localField: 'playersData.team',
                    foreignField: '_id',
                    as: 'team'
                }
            });
            playerPipe.push({
                $unwind: { path: "$team" }
            });
            playerPipe.push({
                $project: {
                    _id: 0,
                    matchPlayerId: '$_id',
                    playerpoints: '0',
                    playername: '$name',
                    playercredit: '$credit',
                    playerid: 1,
                    battingstyle: '$playersData.battingstyle',
                    bowlingstyle: '$playersData.bowlingstyle',
                    playercountry: '$playersData.country',
                    playerdob: '$playersData.dob',
                    team: '$team.teamName',
                    teamShort_name: '$team.short_name',
                    playerimage: {
                        $ifNull: [{
                            $cond: {
                                if: { $or: [{ $eq: [{ $substr: ['$playersData.image', 0, 1] }, '/'] }, { $eq: [{ $substr: ['$playersData.image', 0, 1] }, 'p'] }] },
                                then: { $concat: [`${constant.BASE_URL}`, '', '$playersData.image'] },
                                else: '$playersData.image',
                            }
                        }, `${constant.BASE_URL}avtar1.png`]
                    },
                    playerrole: '$role',
                    matches: '$allMatches'

                }
            })
            let point = 0;
            let data = await matchPlayersModel.aggregate(playerPipe);
            // console.log(`memb`, data.matches);
            if (data.length > 0) {
                if (data[0].matches.length > 0) {
                    let temparr = [];
                    for (let memb of data[0].matches) {
                        let resData = await matchPlayersModel.findOne({ matchkey: mongoose.Types.ObjectId(memb._id), playerid: mongoose.Types.ObjectId(data[0].playerid) }, { points: 1, _id: 0 });
                        // console.log(`resData`, resData);
                        if (moment(moment().format("YYYY-MM-DD HH:mm:ss")).isAfter(memb.start_date)) {
                            if (resData) {
                                let tempObj = {}
                                tempObj.total_points = `${0}`;
                                point += resData.points;
                                tempObj.total_points = `${resData.points}`;
                                tempObj.matchdate = moment(memb.start_date).format("DD MMMM, YYYY");
                                tempObj.selectper = '0%';
                                tempObj.playerid = data[0].playerid;
                                tempObj.name = memb.name;
                                tempObj.short_name = memb.short_name;
                                temparr.push(tempObj);
                                data[0].playerpoints = `${point}`;
                            }
                        }
                    }
                    data[0].matches = temparr;
                    return {
                        message: 'Player Info',
                        status: true,
                        data: data[0]
                    }
                } else {
                    return {
                        message: 'Player Info without matches',
                        status: true,
                        data: data[0]
                    }
                }
                // console.log(`point`, point);
            } else {
                return {
                    message: 'Player Info Not Found',
                    status: false,
                    data: {}
                }
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function createMyTeam
     * @description  Create Team to join the legues of matches
     * @param { matchkey, teamnumber, player_type, players, captain, vicecaptain, type }
     * @author Devanshu Gautam
     */

    async createMyTeam(req) {
        try {
            const { matchkey, teamnumber, player_type, players, captain, vicecaptain } = req.body;
            const playerArray = players.split(','),
                playerObjectIdArray = [];
            if (playerArray.length < 11) {
                return {
                    message: 'Select atleast 11 players.',
                    status: false,
                    data: {}
                };
            }
            for (const playerObjectId of playerArray) playerObjectIdArray.push(mongoose.Types.ObjectId(playerObjectId));

            const matchPlayersData = await matchPlayersModel.find({ matchkey: matchkey });
            let credit = 0;
            if (matchPlayersData.length > 0) {
                for (let playerData of matchPlayersData) {
                    if (playerArray.includes(playerData.playerid.toString())) {
                        credit += playerData.credit;
                    }
                }
            }
            if (credit > 100) {
                return {
                    message: 'Credit exceeded.',
                    status: false,
                    data: {}
                };
            }
            const joinlist = await JoinTeamModel.find({ matchkey: matchkey, userid: req.user._id, player_type: player_type }).sort({ teamnumber: -1 });

            const duplicateData = await this.checkForDuplicateTeam(joinlist, captain, vicecaptain, playerArray, teamnumber);
            if (duplicateData === false) {
                return {
                    message: 'You cannot create the same team.',
                    status: false,
                    data: {}
                };
            }
            let listmatchData = await listMatchesModel.findOne({ _id: mongoose.Types.ObjectId(matchkey) });
            const matchTime = await this.getMatchTime(listmatchData.start_date);
            if (matchTime === false) {
                return {
                    message: 'Match has been closed, You cannot create or edit team now',
                    status: false,
                    data: {}
                }
            }
            const data = {},
                lastplayerArray = [];
            let joinTeamId;

            data['userid'] = req.user._id;
            data['matchkey'] = matchkey;
            data['teamnumber'] = teamnumber;
            data['players'] = playerObjectIdArray;
            // data['playersArray'] = players;
            data['player_type'] = player_type;
            data['captain'] = captain;
            data['vicecaptain'] = vicecaptain;
            const joinTeam = await JoinTeamModel.findOne({
                matchkey: matchkey,
                teamnumber: parseInt(teamnumber),
                userid: req.user._id,
                player_type: player_type,
            }).sort({ teamnumber: -1 });
            if (joinTeam) {
                data['created_at'] = joinTeam.created_at;
                const updateTeam = await JoinTeamModel.findOneAndUpdate({ _id: joinTeam._id }, data, {
                    new: true,
                });
                if (updateTeam) {
                    return {
                        message: 'Team Updated Successfully',
                        status: true,
                        data: {
                            teamid: updateTeam._id
                        }
                    }
                }
            } else {
                const joinTeam = await JoinTeamModel.find({
                    matchkey: matchkey,
                    userid: req.user._id,
                });
                if (joinTeam.length > 0) {
                    data['teamnumber'] = joinTeam.length + 1;
                } else {
                    data['teamnumber'] = 1;
                }
                if (data['teamnumber'] <= 11) {
                    let jointeamData = await JoinTeamModel.create(data);
                    if (jointeamData) {
                        return {
                            message: 'Team Created Successfully',
                            status: true,
                            data: {
                                teamid: jointeamData._id
                            }
                        }
                    }
                } else {
                    return {
                        message: 'You Cannot Create More Team',
                        status: false,
                        data: {}
                    }
                }
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function checkForDuplicateTeam
     * @description Check that the incoming team is already esist or not.
     * @param { joinlist, captain, vicecaptain, playerArray, teamnumber}
     * @author Devanshu Gautam
     */
    async checkForDuplicateTeam(joinlist, captain, vicecaptain, playerArray, teamnumber) {
        if (joinlist.length == 0) return true;
        for await (const list of joinlist) {
            if (
                captain == list.captain &&
                vicecaptain == list.vicecaptain &&
                teamnumber != list.teamnumber
            ) {
                const playerscount = await this.findArrayIntersection(playerArray, list.players);
                if (playerscount.length == playerArray.length) return false;
            }
        }
        return true;
    }

    /**
     * @function findArrayIntersection
     * @description find Array Inter section
     * @param { nowplayers,previousPlayers}
     * @author Devanshu Gautam
     */
    async findArrayIntersection(nowplayers, previousPlayers) {
        const c = [];
        let j = 0,
            i = 0;
        for (i = 0; i < nowplayers.length; ++i) {
            if (previousPlayers.indexOf(nowplayers[i]) != -1) {
                c[j++] = nowplayers[i];
            }
        }
        if (i >= nowplayers.length) {
            return c;
        }
    }

    /**
     * @function getMatchTime
     * @description Check the match time
     * @param { matchkey}
     * @author Devanshu Gautam
     */
    async getMatchTime(start_date) {
        const currentdate = new Date();
        const currentOffset = currentdate.getTimezoneOffset();
        const ISTOffset = 330; // IST offset UTC +5:30
        const ISTTime = new Date(currentdate.getTime() + (ISTOffset + currentOffset) * 60000);
        if (ISTTime >= start_date) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * @function getMyTeams
     * @description Get My All Teams
     * @param { matchkey, challengeid }
     * @author Devanshu Gautam
     */
    async getMyTeams(req) {
        try {
            let finalData = [];
            const listmatchData = await listMatchesModel.findOne({ _id: req.query.matchkey }).populate({
                path: 'team1Id',
                select: 'short_name'
            }).populate({
                path: 'team2Id',
                select: 'short_name'
            });
            // console.log(listmatchData, '-----------------------')
            const createTeams = await JoinTeamModel.find({
                matchkey: req.query.matchkey,
                userid: req.user._id,
            }).populate({
                path: 'players',
                select: ["player_name", "image", "role", "team"],
            }).populate({
                path: 'captain',
                select: ["player_name", "image", "role", "team"],
            }).populate({
                path: 'vicecaptain',
                select: ["player_name", "image", "role", "team"],
            });
            if (createTeams.length == 0) {
                return {
                    message: 'Teams Not Available',
                    status: false,
                    data: []
                }
            }
            const matchchallenges = await matchchallengesModel.find({ matchkey: mongoose.Types.ObjectId(req.query.matchkey) });
            let i = 0;
            for (let element of createTeams) {
                i++
                const tempObj = {
                    status: 1,
                    userid: req.user._id,
                    teamnumber: element.teamnumber,
                    jointeamid: element._id,
                    team1_name: listmatchData.team1Id.short_name,
                    team2_name: listmatchData.team2Id.short_name,
                    player_type: element.player_type || constant.PLAYER_TYPE.CLASSIC,
                    captain: element.captain ? element.captain.player_name : '',
                    vicecaptain: element.vicecaptain ? element.vicecaptain.player_name : '',
                    captainimage: element.captain ?
                        element.captain.image != '' &&
                        element.captain.image != null &&
                        element.captain.image != undefined ? element.captain.image : `${constant.BASE_URL}avtar1.png` : `${constant.BASE_URL}avtar1.png`,
                    vicecaptainimage: element.vicecaptain ?
                        element.vicecaptain.image != '' &&
                        element.vicecaptain.image != null &&
                        element.vicecaptain.image != undefined ? element.vicecaptain.image : `${constant.BASE_URL}avtar1.png` : `${constant.BASE_URL}avtar1.png`,
                    captainimage1: '',
                    vicecaptainimage1: '',
                    isSelected: false,
                };

                if (matchchallenges.length != 0 && req.query.matchchallengeid) {
                    for await (const challenges of matchchallenges) {
                        if (challenges._id.toString() == req.query.matchchallengeid.toString()) {
                            const joindata = await JoinLeaugeModel.findOne({
                                challengeid: req.query.matchchallengeid,
                                teamid: element._id,
                                userid: req.user._id,
                            });
                            if (joindata) tempObj['isSelected'] = true;
                        }
                    }
                }
                let team1count = 0,
                    team2count = 0,
                    batsCount = 0,
                    blowCount = 0,
                    wicketKeeperCount = 0,
                    allCount = 0;
                const players = [];
                for await (const playerData of element.players) {
                    const filterData = await matchPlayersModel.findOne({ playerid: playerData._id });
                    if (!playerData) break;
                    if (filterData.role == constant.ROLE.BAT) {
                        batsCount++;
                    }
                    if (filterData.role == constant.ROLE.BOWL) {
                        blowCount++;
                    }
                    if (filterData.role == constant.ROLE.ALL) {
                        allCount++;
                    }
                    if (filterData.role == constant.ROLE.WK) {
                        wicketKeeperCount++;
                    }
                    if (listmatchData.team1Id._id.toString() == playerData.team.toString()) {
                        team1count++;
                    }
                    if (listmatchData.team2Id._id.toString() == playerData.team.toString()) {
                        team2count++;
                    }
                    players.push({
                        id: playerData._id,
                        name: playerData.player_name,
                        role: filterData.role,
                        credit: `${filterData.credit}`,
                        playingstatus: filterData.playingstatus,
                        // team: team.short_name,
                        team: listmatchData.team1Id._id.toString() == playerData.team.toString() ? 'team1' : 'team2',
                        image: playerData.image != '' &&
                            playerData.image != null &&
                            playerData.image != undefined ? playerData.image : `${constant.BASE_URL}avtar1.png`,
                        image1: '',
                        captain: element.captain._id.toString() == playerData._id.toString() ? 1 : 0,
                        vicecaptain: element.vicecaptain._id.toString() == playerData._id.toString() ? 1 : 0,
                        points: `${element.captain._id.toString() == playerData._id.toString() ?
                            parseFloat(filterData.points.toFixed(2)) * 2 : element.vicecaptain._id.toString() == playerData._id.toString() ?
                            parseFloat(filterData.points.toFixed(2)) * 1.5 : filterData.points}`,
                    });
                }
                tempObj['team1count'] = team1count;
                tempObj['team2count'] = team2count;
                tempObj['batsmancount'] = batsCount;
                tempObj['bowlercount'] = blowCount;
                tempObj['wicketKeeperCount'] = wicketKeeperCount;
                tempObj['allroundercount'] = allCount;
                tempObj['player'] = players;
                finalData.push(tempObj);
                if (i == createTeams.length) {
                    return {
                        message: 'Team Data',
                        status: true,
                        data: finalData
                    }
                }
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function viewTeam
     * @description view a perticular Team Detail of a user
     * @param { matchkey, jointeamid, teamnumber }
     * @author Devanshu Gautam
     */
    async viewTeam(req) {
        try {
            let finalData = [];
            const listmatchData = await listMatchesModel.findOne({ _id: req.query.matchkey });
            const createTeam = await JoinTeamModel.findOne({
                _id: req.query.jointeamid,
                matchkey: req.query.matchkey,
                teamnumber: req.query.teamnumber
            }).populate({
                path: 'players',
                select: ["player_name", "image", "role", "team"],
            }).populate({
                path: 'captain',
                select: ["player_name", "image", "role", "team"],
            }).populate({
                path: 'vicecaptain',
                select: ["player_name", "image", "role", "team"],
            });
            if (!createTeam) {
                return {
                    message: 'Team Not Available',
                    status: false,
                    data: []
                }
            }
            for await (const playerData of createTeam.players) {
                const filterData = await matchPlayersModel.findOne({ playerid: playerData._id, matchkey: mongoose.Types.ObjectId(req.query.matchkey) });
                if (!playerData) break;
                finalData.push({
                    id: playerData._id,
                    name: playerData.player_name,
                    role: filterData.role,
                    credit: filterData.credit,
                    playingstatus: filterData.playingstatus,
                    team: listmatchData.team1Id.toString() == playerData.team.toString() ? 'team1' : 'team2',
                    image: playerData.image != '' &&
                        playerData.image != null &&
                        playerData.image != undefined ? playerData.image : `${constant.BASE_URL}avtar1.png`,
                    image1: '',
                    captain: createTeam.captain._id.toString() == playerData._id.toString() ? 1 : 0,
                    vicecaptain: createTeam.vicecaptain._id.toString() == playerData._id.toString() ? 1 : 0,
                    points: filterData.points,
                    isSelected: false,
                });
            }
            if (finalData.length == createTeam.players.length) {
                return {
                    message: 'User Perticular Team Data',
                    status: true,
                    data: finalData
                }
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function getLiveScores
     * @description Match Live score
     * @param { matchkey }
     * @author Devanshu Gautam
     */
    async getLiveScores(req) {
        try {
            let matchrunData = await matchrunModel.findOne({ matchkey: mongoose.Types.ObjectId(req.query.matchkey) });
            if (!matchrunData || !matchrunData.overs1 == undefined) {
                return {
                    message: 'Match Live score Not Found',
                    status: false,
                    data: {
                        Team1: '',
                        Team2: '',
                        Team1_Totalovers1: 0,
                        Team1_Totalovers2: 0,
                        Team1_Totalruns1: 0,
                        Team1_Totalruns2: 0,
                        Team1_Totalwickets1: 0,
                        Team1_Totalwickets2: 0,
                        Team2_Totalwickets1: 0,
                        Team2_Totalwickets2: 0,
                        Team2_Totalovers1: 0,
                        Team2_Totalovers2: 0,
                        Team2_Totalruns1: 0,
                        Team2_Totalruns2: 0,
                        Winning_Status: '',
                    }
                }
            }

            const over1 = matchrunData.overs1.split(',');
            const over2 = matchrunData.overs2.split(',');
            const wicket1 = matchrunData.wickets1.split(',');
            const wicket2 = matchrunData.wickets2.split(',');
            const runs1 = matchrunData.runs1.split(',');
            const runs2 = matchrunData.runs2.split(',');
            return {
                message: 'Match Live score',
                status: true,
                data: {
                    Team1: matchrunData.teams1.toUpperCase() || '',
                    Team2: matchrunData.teams2.toUpperCase() || '',
                    Team1_Totalovers1: over1[0] && over1[0] != null && over1[0] != undefined && over1[0] != '' ?
                        over1[0] : matchrunData.overs1,
                    Team1_Totalovers2: over1[1] && over1[1] != null && over1[1] != undefined && over1[1] != '' ? over1[1] : '0',
                    Team1_Totalruns1: runs1[0] && runs1[0] != null && runs1[0] != undefined && runs1[0] != '' ?
                        runs1[0] : matchrunData.runs1,
                    Team1_Totalruns2: runs1[1] && runs1[1] != null && runs1[1] != undefined && runs1[1] != '' ? runs1[1] : '0',
                    Team1_Totalwickets1: wicket1[0] && wicket1[0] != null && wicket1[0] != undefined && wicket1[0] != '' ?
                        wicket1[0] : matchrunData.wickets1,
                    Team1_Totalwickets2: wicket1[1] && wicket1[1] != null && wicket1[1] != undefined && wicket1[1] != '' ?
                        wicket1[1] : '0',
                    Team2_Totalwickets1: wicket2[0] && wicket2[0] != null && wicket2[0] != undefined && wicket2[0] != '' ?
                        wicket2[0] : matchrunData.wickets2,
                    Team2_Totalwickets2: wicket2[1] && wicket2[1] != null && wicket2[1] != undefined && wicket2[1] != '' ?
                        wicket2[1] : '0',
                    Team2_Totalovers1: over2[0] && over2[0] != null && over2[0] != undefined && over2[0] != '' ?
                        over2[0] : matchrunData.overs2,
                    Team2_Totalovers2: over2[1] && over2[1] != null && over2[1] != undefined && over2[1] != '' ? over2[1] : '0',
                    Team2_Totalruns1: runs2[0] && runs2[0] != null && runs2[0] != undefined && runs2[0] != '' ?
                        runs2[0] : matchrunData.runs2,
                    Team2_Totalruns2: runs2[1] && runs2[1] != null && runs2[1] != undefined && runs2[1] != '' ? runs2[1] : '0',
                    Winning_Status: matchrunData.winning_status != '0' ?
                        matchrunData.winning_status != 'No result' ?
                        matchrunData.winning_status :
                        '' : '',
                }
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function liveRanksLeaderboard
     * @description Live score lederbord of match
     * @param { matchkey,challengeid }
     * @author Devanshu Gautam
     */
    async liveRanksLeaderboard(req) {
        try {
            let listmatchData = await listMatchesModel.findOne({ _id: mongoose.Types.ObjectId(req.query.matchkey) }).select('final_status');
            const aggPipe = [];
            aggPipe.push({
                $match: {
                    matchkey: mongoose.Types.ObjectId(req.query.matchkey),
                    challengeid: mongoose.Types.ObjectId(req.query.matchchallengeid),
                }
            });
            aggPipe.push({
                $lookup: {
                    from: 'jointeams',
                    localField: 'teamid',
                    foreignField: '_id',
                    as: 'jointeam',
                },
            });
            aggPipe.push({
                $lookup: {
                    from: 'users',
                    localField: 'userid',
                    foreignField: '_id',
                    as: 'user',
                },
            });
            aggPipe.push({
                $addFields: {
                    jointeam: '',
                    teamnumber: { $ifNull: [{ $arrayElemAt: ['$jointeam.teamnumber', 0] }, '0'] },
                    points: { $ifNull: [{ $arrayElemAt: ['$jointeam.points', 0] }, '0'] },
                    lastpoints: { $ifNull: [{ $arrayElemAt: ['$jointeam.lastpoints', 0] }, '0'] },
                    team: { $ifNull: [{ $arrayElemAt: ['$user.team', 0] }, ''] },
                    image: { $ifNull: [{ $arrayElemAt: ['$user.image', 0] }, `${constant.BASE_URL}avtar1.png`] },
                },
            });
            aggPipe.push({
                $sort: {
                    lastpoints: -1,
                },
            });
            aggPipe.push({
                $group: {
                    _id: '',
                    rankedUser: {
                        $push: {
                            _id: '$_id',
                            userid: '$userid',
                            jointeamid: '$teamid',
                            teamnumber: '$teamnumber',
                            points: '$points',
                            lastpoints: '$lastpoints',
                            team: '$team',
                            image: '$image',
                        },
                    },
                },
            });
            aggPipe.push({
                $addFields: {
                    rankedUser: '',
                    rankBypoints: {
                        $let: {
                            vars: {
                                extract: {
                                    $reduce: {
                                        input: '$rankedUser',
                                        initialValue: { a: [], order: 0, prevRank: undefined, prevVal: undefined },
                                        in: {
                                            $let: {
                                                vars: {
                                                    order: {
                                                        $add: ['$$value.order', 1],
                                                    },
                                                    rank: {
                                                        $cond: [
                                                            { $ne: ['$$this.lastpoints', '$$value.prevVal'] },
                                                            { $add: ['$$value.order', 1] },
                                                            '$$value.prevRank',
                                                        ],
                                                    },
                                                },
                                                in: {
                                                    a: {
                                                        $concatArrays: [
                                                            '$$value.a', [{ $mergeObjects: ['$$this', { rank: '$$rank' }] }],
                                                        ],
                                                    },
                                                    prevVal: '$$this.lastpoints',
                                                    order: '$$order',
                                                    prevRank: '$$rank',
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            in: '$$extract.a',
                        },
                    },
                },
            });
            aggPipe.push({
                $sort: {
                    points: -1,
                },
            });
            aggPipe.push({
                $unwind: {
                    path: '$rankBypoints',
                    preserveNullAndEmptyArrays: true,
                },
            });
            aggPipe.push({
                $project: {
                    _id: '$rankBypoints._id',
                    userid: '$rankBypoints.userid',
                    jointeamid: '$rankBypoints.jointeamid',
                    teamnumber: { $ifNull: ['$rankBypoints.teamnumber', '0'] },
                    points: { $ifNull: ['$rankBypoints.points', '0'] },
                    lastpoints: { $ifNull: ['$rankBypoints.lastpoints', '0'] },
                    team: { $ifNull: ['$rankBypoints.team', '0'] },
                    image: {
                        $ifNull: [
                            '$rankBypoints.image',
                            `${constant.BASE_URL}avtar1.png`,
                        ],
                    },
                    lastrank: '$rankBypoints.rank',
                },
            });
            aggPipe.push({
                $sort: {
                    points: -1,
                },
            });
            aggPipe.push({
                $group: {
                    _id: '',
                    rankedUser: {
                        $push: {
                            _id: '$_id',
                            userid: '$userid',
                            jointeamid: '$jointeamid',
                            teamnumber: '$teamnumber',
                            points: '$points',
                            lastpoints: '$lastpoints',
                            team: '$team',
                            image: '$image',
                            lastrank: '$lastrank',
                        },
                    },
                },
            });
            aggPipe.push({
                $addFields: {
                    rankedUser: '',
                    rankBypoints: {
                        $let: {
                            vars: {
                                extract: {
                                    $reduce: {
                                        input: '$rankedUser',
                                        initialValue: { a: [], order: 0, prevRank: undefined, prevVal: undefined },
                                        in: {
                                            $let: {
                                                vars: {
                                                    order: {
                                                        $add: ['$$value.order', 1],
                                                    },
                                                    rank: {
                                                        $cond: [
                                                            { $ne: ['$$this.points', '$$value.prevVal'] },
                                                            { $add: ['$$value.order', 1] },
                                                            '$$value.prevRank',
                                                        ],
                                                    },
                                                },
                                                in: {
                                                    a: {
                                                        $concatArrays: [
                                                            '$$value.a', [{ $mergeObjects: ['$$this', { rank: '$$rank' }] }],
                                                        ],
                                                    },
                                                    prevVal: '$$this.points',
                                                    order: '$$order',
                                                    prevRank: '$$rank',
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            in: '$$extract.a',
                        },
                    },
                },
            });
            aggPipe.push({
                $unwind: {
                    path: '$rankBypoints',
                    preserveNullAndEmptyArrays: true,
                },
            });
            if (listmatchData.final_status == constant.MATCH_FINAL_STATUS.WINNER_DECLARED) {
                aggPipe.push({
                    $lookup: {
                        from: 'finalresults',
                        localField: 'rankBypoints._id',
                        foreignField: 'joinedid',
                        as: 'finalResult',
                    },
                });
            }
            aggPipe.push({
                $project: {
                    _id: 0,
                    userjoinid: '$rankBypoints._id',
                    userid: '$rankBypoints.userid',
                    jointeamid: '$rankBypoints.jointeamid',
                    teamnumber: { $ifNull: ['$rankBypoints.teamnumber', 0] },
                    points: { $ifNull: ['$rankBypoints.points', 0] },
                    lastpoints: { $ifNull: ['$rankBypoints.lastpoints', 0] },
                    teamname: { $ifNull: ['$rankBypoints.team', 0] },
                    getlastrank: '$rankBypoints.lastrank',
                    getcurrentrank: '$rankBypoints.rank',
                    image: {
                        $cond: {
                            if: { $and: [{ $ne: ['$rankBypoints.image', 'null'] }, { $ne: ['$regdata.image', ''] }] },
                            then: '$rankBypoints.image',
                            else: `${constant.BUCKET_URL}avtar1.png`,
                        },
                    },
                    userno: {
                        $cond: {
                            if: { $eq: ['$rankBypoints.userid', mongoose.Types.ObjectId(req.user._id)] },
                            then: -1,
                            else: 0,
                        },
                    },
                    is_show: {
                        $cond: {
                            if: { $eq: ['$rankBypoints.userid', mongoose.Types.ObjectId(req.user._id)] },
                            then: true,
                            else: false,
                        },
                    },
                    player_type: 'classic',
                    arrowname: {
                        $cond: {
                            if: { $gt: ['$rankBypoints.rank', '$rankBypoints.lastrank'] },
                            then: 'down-arrow',
                            else: {
                                $cond: {
                                    if: { $eq: ['$rankBypoints.rank', '$rankBypoints.lastrank'] },
                                    then: 'equal-arrow',
                                    else: {
                                        $cond: {
                                            if: { $lt: ['$rankBypoints.rank', '$rankBypoints.lastrank'] },
                                            then: 'up-arrow',
                                            else: '',
                                        },
                                    },
                                },
                            },
                        },
                    },
                    winingamount: { $toString: { $ifNull: [{ $arrayElemAt: ['$finalResult.amount', 0] }, ''] } },
                },
            });
            aggPipe.push({
                $sort: {
                    userno: 1,
                    getcurrentrank: 1,
                    userid: -1,
                    teamnumber: 1,
                },
            });
            const finalData = await JoinLeaugeModel.aggregate(aggPipe);
            if (finalData.length > 0) {
                return {
                    message: "Live score lederbord of match",
                    status: true,
                    data: {
                        team_number_get: finalData[0].teamnumber,
                        userrank: finalData[0].getcurrentrank,
                        pdfname: '',
                        jointeams: finalData ? finalData : [],
                    }
                }
            } else {
                return {
                    message: 'Live score lederbord of match Not Found',
                    status: false,
                    data: {}
                }
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function fantasyScoreCards
     * @description Match Player stats shows up
     * @param { matchkey }
     * @author Devanshu Gautam
     */
    async fantasyScoreCards(req) {
        try {
            let finalData = [],
                aggpipe = [],
                ends = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'];
            // const joinData = await JoinTeamModel.find({ matchkey: req.query.matchkey });
            // const matchplayer = await matchPlayersModel.find({ matchkey: req.query.matchkey }).populate({
            //     path: 'matchkey',
            //     select: 'name, '
            // });
            aggpipe.push({
                $match: { matchkey: mongoose.Types.ObjectId(req.query.matchkey) }
            });
            aggpipe.push({
                $lookup: {
                    from: 'listmatches',
                    localField: 'matchkey',
                    foreignField: '_id',
                    as: 'match'
                }
            });
            aggpipe.push({
                $addFields: { matchname: { $arrayElemAt: ['$match.name', 0] }, }
            });
            aggpipe.push({
                $project: {
                    _id: 0,
                    matchplayerid: '$_id',
                    matchkey: 1,
                    playerid: 1,
                    role: 1,
                    credit: 1,
                    name: 1,
                    legal_name: 1,
                    battingstyle: 1,
                    bowlingstyle: 1,
                    playingstatus: 1,
                    vplaying: 1,
                    players_count: 1,
                    matchname: 1
                }
            });
            aggpipe.push({
                $lookup: {
                    from: 'players',
                    let: { playerid: '$playerid' },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $eq: ['$_id', '$$playerid']
                            }
                        }
                    }, {
                        $lookup: {
                            from: 'teams',
                            localField: 'team',
                            foreignField: '_id',
                            as: 'team'
                        }
                    }, {
                        $project: {
                            _id: 0,
                            image: 1,
                            team: { $arrayElemAt: ["$team.short_name", 0] },

                        }
                    }],
                    as: 'playerimage'
                }
            });
            aggpipe.push({
                $addFields: {
                    teamShortName: { $arrayElemAt: ["$playerimage.team", 0] },
                    playerimage: { $arrayElemAt: ["$playerimage.image", 0] },
                }
            });
            aggpipe.push({
                $lookup: {
                    from: 'resultmatches',
                    let: { matchkey: '$matchkey', playerid: '$playerid' },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [{ $eq: ['$matchkey', '$$matchkey'] }, { $eq: ['$player_id', '$$playerid'] }]
                            }
                        }
                    }],
                    as: 'result'
                }
            });
            aggpipe.push({
                $lookup: {
                    from: 'resultpoints',
                    let: { matchkey: '$matchkey', playerid: '$playerid' },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [{ $eq: ['$matchkey', '$$matchkey'] }, { $eq: ['$player_id', '$$playerid'] }]
                            }
                        }
                    }],
                    as: 'resultpoint'
                }
            });
            aggpipe.push({
                $project: {
                    playername: '$name',
                    playerimage: {
                        $ifNull: [{
                            $cond: {
                                if: { $or: [{ $eq: [{ $substr: ['$playerimage', 0, 1] }, '/'] }, { $eq: [{ $substr: ['$playerimage', 0, 1] }, 'p'] }] },
                                then: { $concat: [`${constant.BASE_URL}`, '', '$playerimage'] },
                                else: {
                                    $cond: {
                                        if: { $eq: ['$playerimage', ''] },
                                        then: `${constant.BASE_URL}player.png`,
                                        else: '$playerimage'
                                    }
                                },
                            }
                        }, `${constant.BASE_URL}player.png`]
                    },
                    matchname: 1,
                    duck: { $arrayElemAt: ['$result.duck', 0] },
                    innings: { $arrayElemAt: ['$result.innings', 0] },
                    teamShortName: 1,
                    startingpoints: { $arrayElemAt: ['$resultpoint.startingpoints', 0] },
                    runs: { $arrayElemAt: ['$resultpoint.runs', 0] },
                    fours: { $arrayElemAt: ['$resultpoint.fours', 0] },
                    sixs: { $arrayElemAt: ['$resultpoint.sixs', 0] },
                    strike_rate: { $arrayElemAt: ['$resultpoint.strike_rate', 0] },
                    century: { $sum: [{ $arrayElemAt: ['$resultpoint.century', 0] }, { $arrayElemAt: ['$resultpoint.halfcentury', 0] }] },
                    wickets: { $arrayElemAt: ['$resultpoint.wickets', 0] },
                    maidens: { $arrayElemAt: ['$resultpoint.maidens', 0] },
                    economy_rate: { $arrayElemAt: ['$resultpoint.economy_rate', 0] },
                    runouts: { $arrayElemAt: ['$resultpoint.runouts', 0] },
                    catch: { $arrayElemAt: ['$resultpoint.catch', 0] },
                    catchpoints: { $arrayElemAt: ['$resultpoint.catch', 0] },
                    stumping: { $sum: [{ $arrayElemAt: ['$resultpoint.stumping', 0] }, { $arrayElemAt: ['$resultpoint.thrower', 0] }, { $arrayElemAt: ['$resultpoint.hitter', 0] }] },
                    bonus: { $arrayElemAt: ['$resultpoint.bonus', 0] },
                    negative: { $arrayElemAt: ['$resultpoint.negative', 0] },
                    total: { $arrayElemAt: ['$resultpoint.total', 0] },
                    selectper: { $ifNull: ['$selectper', '0%'] }

                }
            })
            const matchplayer = await matchPlayersModel.aggregate(aggpipe);
            if (matchplayer.length > 0) {
                return {
                    message: 'Match Player stats data...',
                    status: true,
                    data: matchplayer
                }
            } else {
                return {
                    message: 'Match Player stats data not found...',
                    status: false,
                    data: []
                }
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function matchlivedata
     * @description match live score
     * @param { matchkey(query) }
     * @author Devanshu Gautam
     */
    async matchlivedata(req) {
        try {
            let inningarr = [];
            let match = await listMatchesModel.findOne({ _id: mongoose.Types.ObjectId(req.query.matchkey) });
            if (match) {
                let matchScoreData = await EntityApiController.getmatchscore(match.real_matchkey);
                // console.log(`matchScoreData`, matchScoreData);
                if (matchScoreData) {
                    if (matchScoreData.innings.length > 0) {
                        for (let innings of matchScoreData.innings) {
                            let inningObj = {};
                            inningObj.name = innings.name;
                            inningObj.scores = innings.scores_full;

                            //  Inserting Batsmen Of That Inning------------------------ 
                            if (innings.batsmen.length > 0) {
                                let batsmenarr = [];
                                let i = 0;
                                for (let batsmen of innings.batsmen) {
                                    i++;
                                    let batsmenObj = {};
                                    batsmenObj.name = batsmen.name;
                                    batsmenObj.role = batsmen.role;
                                    batsmenObj.how_out = batsmen.how_out;
                                    batsmenObj.runs = batsmen.runs;
                                    batsmenObj.balls = batsmen.balls_faced;
                                    batsmenObj.fours = batsmen.fours;
                                    batsmenObj.sixes = batsmen.sixes;
                                    batsmenObj.strike_rate = batsmen.strike_rate;
                                    batsmenObj.batting = batsmen.batting;
                                    batsmenObj.dismissal = batsmen.dismissal;
                                    batsmenarr.push(batsmenObj);
                                    if (i == innings.batsmen.length) {
                                        inningObj.batsmen = batsmenarr;
                                    }
                                }
                            } else {
                                inningObj.batsmen = [];
                            }
                            inningObj.extra_runs = innings.extra_runs; // extras
                            inningObj.equations = innings.equations; // total

                            //  concatenate name of batsmen that not bat Of That Inning------------------------ 
                            inningObj.did_not_bat = '';
                            let i = 0;
                            if (innings.did_not_bat.length > 0) {
                                for (let did_not_bat of innings.did_not_bat) {
                                    i++;
                                    if (innings.did_not_bat.length == i) {
                                        inningObj.did_not_bat += `${did_not_bat.name}`
                                    } else {
                                        inningObj.did_not_bat += `${did_not_bat.name},`
                                    }
                                }
                            }

                            //  Inserting Bowlers Of That Inning------------------------ 
                            if (innings.bowlers.length > 0) {
                                let bowlersarr = [];
                                let i = 0;
                                for (let bowlers of innings.bowlers) {
                                    i++;
                                    let bowlersObj = {};
                                    bowlersObj.name = bowlers.name;
                                    bowlersObj.overs = bowlers.overs;
                                    bowlersObj.maidens = bowlers.maidens;
                                    bowlersObj.runs = bowlers.runs_conceded;
                                    bowlersObj.balls = bowlers.balls_faced;
                                    bowlersObj.wickets = bowlers.wickets;
                                    bowlersObj.economy_rate = bowlers.econ;
                                    bowlersObj.bowling = bowlers.bowling;
                                    bowlersarr.push(bowlersObj);
                                    if (i == innings.bowlers.length) {
                                        inningObj.bowlers = bowlersarr;
                                    }
                                }
                            } else {
                                inningObj.bowlers = [];
                            }

                            //  Inserting Fall Of Wickets Of That Inning------------------------ 
                            if (innings.fows.length > 0) {
                                let fowsarr = [];
                                let i = 0;
                                for (let fows of innings.fows) {
                                    i++;
                                    let fowsObj = {};
                                    fowsObj.name = fows.name;
                                    fowsObj.runs = fows.runs;
                                    fowsObj.balls = fows.balls;
                                    fowsObj.score_at_dismissal = String(fows.score_at_dismissal);
                                    fowsObj.overs_at_dismissal = fows.overs_at_dismissal;
                                    fowsObj.number = fows.number;
                                    fowsObj.dismissal = fows.dismissal;
                                    fowsarr.push(fowsObj);
                                    if (i == innings.fows.length) {
                                        inningObj.fall_of_wickets = fowsarr;
                                    }
                                }
                            } else {
                                inningObj.fall_of_wickets = [];
                            }

                            //  Inserting Inning------------------------ 
                            inningarr.push(inningObj)
                        }
                    }
                    if (matchScoreData.innings.length == inningarr.length) {
                        return {
                            message: 'match live score in brief',
                            status: true,
                            data: inningarr
                        }
                    }
                }
            }
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new matchServices();