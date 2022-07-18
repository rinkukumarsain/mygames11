const randomstring = require("randomstring");
const fs = require("fs");
const mongoose = require("mongoose");
const moment = require("moment");

const constant = require("../../config/const_credential");
const userModel = require("../../models/userModel");
const matchchallengesModel = require("../../models/matchChallengersModel");
const TransactionModel = require("../../models/transactionModel");
const JoinLeaugeModel = require("../../models/JoinLeaugeModel");
const listMatchesModel = require("../../models/listMatchesModel");
// const joinTeamsModel = require('../../models/JoinTeamModel');
// const matchPlayersModel = require('../../models/matchPlayersModel');
const botPercentageModel = require("../../models/setBotPercentageModel");
const matchChallengersModel = require("../../models/matchChallengersModel");

class botUserService {
  constructor() {
    return {
      botUserData: this.botUserData.bind(this),
      joinBotUser: this.joinBotUser.bind(this),
      setPercentageData: this.setPercentageData.bind(this),
      updatePercentageData: this.updatePercentageData.bind(this),
      joinBotUserAccordingPercentage:
        this.joinBotUserAccordingPercentage.bind(this),
    };
  }

  async genrateReferCode() {
    const coupon = randomstring.generate({
      charset: "alphanumeric",
      length: 8,
    });
    let referCode = `${constant.APP_SHORT_NAME}-${coupon.toUpperCase()}`;
    const checkReferCode = await userModel.findOne({ refer_code: referCode });
    if (checkReferCode) {
      await this.genrateReferCode();
    }
    return referCode;
  }

  async genrateMobile() {
    let firstDigit = Math.floor(Math.random() * (10 - 6) + 6)
    const remeningDigit = randomstring.generate({
      charset: "numeric",
      length: 10,
    });
    let mobile = `${firstDigit}${remeningDigit}`;
    const checkMobile = await userModel.findOne({ mobile: mobile });
    if (checkMobile) {
      await this.genrateReferCode();
    }
    return mobile;
  }

  async getUserName() {
    let json_data = fs.readFileSync("user_name.json", "utf8");
    let data = JSON.parse(json_data);
    const allNames = [];
    for (let i of data.data) {
      allNames.push(i.name);
    }
    let name = allNames[Math.floor(Math.random() * allNames.length)];
    return name;
  }

  async genrateEmail(username) {
    const user = username.substring(0, 5).replace(/\s+/g, "");
    const number = randomstring.generate({ charset: "numeric", length: 4 });
    let email = `${user}${number}@mailinator.com`;
    const checkEmail = await userModel.findOne({ email: email });
    if (checkEmail) {
      await this.genrateEmail();
    }
    return email;
  }

  async genrateTeam(username) {
    const user = username.substring(0, 3).replace(/\s+/g, "");
    const char = randomstring.generate({ charset: "alphabetic", length: 3 });
    const number = randomstring.generate({ charset: "numeric", length: 3 });
    let team = `${user.toLowerCase()}${char.toLowerCase()}${number}`;
    const checkEmail = await userModel.findOne({ team: team });
    if (checkEmail) {
      await this.genrateTeam(username);
    }
    return team;
  }

  async botUserData(req) {
    try {
      const state = [
        "Rajasthan",
        "Haryana",
        "Punjab",
        "Kerala",
        "Assam",
        "Andhra Pradesh",
        "Arunachal Pradesh",
        "Bihar",
        "Chhattisgarh",
        "Goa",
        "Gujarat",
        "Himachal Pradesh",
        "Jammu and Kashmir",
        "Jharkhand",
        "Karnataka",
        "Madhya Pradesh",
        "Maharashtra",
        "Manipur",
        "Meghalaya",
        "Mizoram",
        "Nagaland",
        "Odisha",
        "Sikkim",
        "Tamil Nadu",
        "Telangana",
        "Tripura",
        "Uttar Pradesh",
        "Uttarakhand",
        "West Bengal",
        "Andaman and Nicobar Islands",
        "Chandigarh",
        "Dadar and Nagar Haveli",
        "Daman and Diu",
        "Delhi",
        "Lakshadweep",
        "Puducherry",
      ];

      let botNumber;
      if (req.body.number_of_botuser) {
        botNumber = Number(req.body.number_of_botuser);
      } else {
        botNumber = 1;
      }
      const botUser = await userModel.find({ user_status: { $ne: 0 } });
      let count = 0;
      let newBotData = [];
      for (
        let i = botUser.length + 1;
        i < botUser.length + botNumber + 1;
        i++
      ) {
        count++;
        let data = {};
        const state_data = state[Math.floor(Math.random() * state.length)];
        const refer_code = await this.genrateReferCode();
        const username = await this.getUserName();
        const mobile = await this.genrateMobile();
        const email = await this.genrateEmail(username);
        const team = await this.genrateTeam(username);
        const create_date = moment().format("YYYY-MM-DD");

        const userbalance = { balance: 100000 };
        const user_verify = { email_verify: 1 };

        data["user_status"] = i;
        data["email"] = email;
        data['mobile'] = +mobile;
        data["username"] = username;
        data["state"] = state_data;
        data["team"] = team;
        data["refer_code"] = refer_code;
        data["userbalance"] = userbalance;
        data["user_verify"] = user_verify;
        data["create_date"] = create_date;

        const saveBotUser = await userModel.create(data);
        newBotData.push({
          _id: saveBotUser._id,
          userbalance: saveBotUser.userbalance,
        });
      }
      if (count == botNumber) {
        return {
          message: "bot user added successfully !!!",
          status: true,
          botData: newBotData,
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async getMatchTime(start_date) {
    const currentdate = new Date();
    const currentOffset = currentdate.getTimezoneOffset();
    const ISTOffset = 330; // IST offset UTC +5:30
    const ISTTime = new Date(
      currentdate.getTime() + (ISTOffset + currentOffset) * 60000
    );
    if (ISTTime >= start_date) {
      return false;
    } else {
      return true;
    }
  }

  async getBotUser(challengeid) {
    let pipeline = [];
    pipeline.push({
      $match: {
        user_status: {
          $ne: 0,
        },
      },
    });
    pipeline.push({
      $lookup: {
        from: "joinedleauges",
        let: {
          userid: "$_id",
          challengeid: challengeid,
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$$userid", "$userid"],
              },
            },
          },
          {
            $lookup: {
              from: "matchchallenges",
              localField: "challengeid",
              foreignField: "_id",
              as: "challage",
            },
          },
          {
            $project: {
              _id: 1,
            },
          },
          {
            $group: {
              _id: null,
              myCount: {
                $sum: 1,
              },
            },
          },
        ],
        as: "joinedleauge",
      },
    });
    pipeline.push({
      $addFields: {
        joinedleauge: {
          $ifNull: [
            {
              $arrayElemAt: ["$joinedleauge.myCount", 0],
            },
            0,
          ],
        },
      },
    });
    pipeline.push({
      $lookup: {
        from: "matchchallenges",
        let: {
          challengeid: challengeid,
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$$challengeid", "$_id"],
              },
            },
          },
        ],
        as: "matchchallenge",
      },
    });
    pipeline.push({
      $addFields: {
        multi_entry: {
          $arrayElemAt: ["$matchchallenge.multi_entry", 0],
        },
        team_limit: {
          $arrayElemAt: ["$matchchallenge.team_limit", 0],
        },
        matchchallenge: {
          $arrayElemAt: ["$matchchallenge._id", 0],
        },
      },
    });
    pipeline.push({
      $match: {
        $and: [
          {
            joinedleauge: {
              $gte: 0,
            },
          },
          {
            joinedleauge: {
              $lt: 1,
            },
          },
        ],
      },
    });
    pipeline.push({
      $project: {
        _id: 1,
        userbalance: 1,
      },
    });

    let botuser = await userModel.aggregate(pipeline);

    for (let i = botuser.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = botuser[i];
      botuser[i] = botuser[j];
      botuser[j] = temp;
    }
    return botuser;
  }

  async joinBotUser(req) {
    try {
      let botUserNumber = Number(req.body.bot_user_number);
      let matchchallengeid = req.body.matchchallengeid;
      let teamType = req.body.cType;
      let totalchallenges = 0,
        totalmatches = 0,
        totalseries = 0,
        joinedMatch = 0,
        joinedSeries = 0;
      let aggpipe = [];
      aggpipe.push({
        $match: { _id: mongoose.Types.ObjectId(matchchallengeid) },
      });
      aggpipe.push({
        $lookup: {
          from: "listmatches",
          localField: "matchkey",
          foreignField: "_id",
          as: "listmatch",
        },
      });

      const matchchallengesData = await matchchallengesModel.aggregate(aggpipe);

      let matchchallenge = matchchallengesData[0];
      let listmatchId = matchchallengesData[0].listmatch[0]._id;
      let matchchallengesDataId = matchchallengesData[0]._id;
      let seriesId = matchchallengesData[0].listmatch[0].series;
      let matchStartDate = matchchallengesData[0].listmatch[0].start_date;

      if (matchchallengesData.length == 0) {
        return {
          message: "Match Not Found",
          status: false,
          data: {},
        };
      }

      const matchTime = await this.getMatchTime(matchStartDate);
      if (matchTime === false) {
        return {
          message: "Match has been closed, You cannot join leauge now.",
          status: false,
          data: {},
        };
      }

      if (matchchallengesData[0].joinedusers < matchchallengesData[0].maximum_user) {
        if (matchchallengesData[0].joinedusers + botUserNumber <= matchchallengesData[0].maximum_user) {
          let botusers = await this.getBotUser(matchchallenge._id);
          if (botusers.length == 0) {
            let getNewBotUser = await this.botUserData(req);
            botusers.push(getNewBotUser.botData[0]);
          }
          console.log('botusers------------------>', botusers)
          let i = 1;
          let b = 0;
          for (let botuser of botusers) {
            b++;
            if (b == botusers.length) {
              let getNewBotUser = await this.botUserData(req);
              botusers.push(getNewBotUser.botData[0]);
            }
            for (i; i <= botUserNumber; i++) {
              if (botuser.userbalance.balance < matchchallengesData[0].entryfee) {
                const userbalance = { balance: 100000 };
                await userModel.updateOne({ _id: botuser._id }, { userbalance: userbalance }, { new: true });
              }

              let jointeamids = null;
              const user = await userModel.findOne({ _id: botuser._id }, { userbalance: 1 });
              if (!user || !user.userbalance) {
                return {
                  message: "Insufficient balance",
                  status: false,
                  data: {},
                };
              }
              const bonus = parseFloat(user.userbalance.bonus.toFixed(2));
              const balance = parseFloat(user.userbalance.balance.toFixed(2));
              const winning = parseFloat(user.userbalance.winning.toFixed(2));
              const totalBalance = bonus + balance + winning;
              let count = 0,
                mainbal = 0,
                mainbonus = 0,
                mainwin = 0,
                tranid = "";
              const result = await this.findJoinLeaugeExist(listmatchId, botuser._id, matchchallenge);
              if (result != 1 && result != 2) {
                const userObj = {
                  "userbalance.balance": balance - mainbal,
                  "userbalance.bonus": bonus - mainbonus,
                  "userbalance.winning": winning - mainwin,
                  $inc: {
                    totalchallenges: totalchallenges,
                    totalmatches: totalmatches,
                    totalseries: totalseries,
                  },
                };
                const transactiondata = {
                  type: "Contest Joining Fee",
                  contestdetail: `${matchchallenge.entryfee}-${count}`,
                  amount: matchchallenge.entryfee * count,
                  total_available_amt: totalBalance - matchchallenge.entryfee * count,
                  transaction_by: constant.TRANSACTION_BY.WALLET,
                  challengeid: matchchallengeid,
                  userid: botuser._id,
                  paymentstatus: constant.PAYMENT_STATUS_TYPES.CONFIRMED,
                  bal_bonus_amt: bonus - mainbonus,
                  bal_win_amt: winning - mainwin,
                  bal_fund_amt: balance - mainbal,
                  cons_amount: mainbal,
                  cons_bonus: mainbonus,
                  cons_win: mainwin,
                  transaction_id: tranid != "" ? tranid : `${constant.APP_SHORT_NAME}-JL-${matchchallengesDataId}-${Date.now()}-${botuser._id}`,
                };
                await Promise.all([
                  userModel.findOneAndUpdate({ _id: botuser._id }, userObj, { new: true }),
                  TransactionModel.create(transactiondata),
                ]);
                if (result == 3) {
                  break;
                } else if (result == 4) {
                  break;
                } else {
                  return result;
                }
              }
              const resultForBonus = await this.findUsableBonusMoney(matchchallenge, bonus - mainbonus, winning - mainwin, balance - mainbal);
              if (resultForBonus == false) {
                if (i > 1) {
                  const userObj = {
                    "userbalance.balance": balance - mainbal,
                    "userbalance.bonus": bonus - mainbonus,
                    "userbalance.winning": winning - mainwin,
                    $inc: {
                      totalchallenges: totalchallenges,
                      totalmatches: totalmatches,
                      totalseries: totalseries,
                    },
                  };
                  const transactiondata = {
                    type: "Contest Joining Fee",
                    contestdetail: `${matchchallenge.entryfee}-${count}`,
                    amount: matchchallenge.entryfee * count,
                    total_available_amt: totalBalance - matchchallenge.entryfee * count,
                    transaction_by: constant.TRANSACTION_BY.WALLET,
                    challengeid: matchchallengeid,
                    userid: botuser._id,
                    paymentstatus: constant.PAYMENT_STATUS_TYPES.CONFIRMED,
                    bal_bonus_amt: bonus - mainbonus,
                    bal_win_amt: winning - mainwin,
                    bal_fund_amt: balance - mainbal,
                    cons_amount: mainbal,
                    cons_bonus: mainbonus,
                    cons_win: mainwin,
                    transaction_id: tranid != "" ? tranid : `${constant.APP_SHORT_NAME}-JL-${matchchallengesDataId}-${Date.now()}-${botuser._id}`,
                  };
                  await Promise.all([
                    userModel.findOneAndUpdate({ _id: botuser._id }, userObj, { new: true }),
                    TransactionModel.create(transactiondata),
                  ]);
                }
                return {
                  message: "Insufficient balance",
                  status: false,
                  data: {},
                };
              }
              const resultForBalance = await this.findUsableBalanceMoney(resultForBonus, balance - mainbal);
              const resultForWinning = await this.findUsableWinningMoney(resultForBalance, winning - mainwin);
              if (resultForWinning.reminingfee > 0) {
                if (i > 1) {
                  const userObj = {
                    "userbalance.balance": balance - mainbal,
                    "userbalance.bonus": bonus - mainbonus,
                    "userbalance.winning": winning - mainwin,
                    $inc: {
                      totalchallenges: totalchallenges,
                      totalmatches: totalmatches,
                      totalseries: totalseries,
                    },
                  };
                  const transactiondata = {
                    type: "Contest Joining Fee",
                    contestdetail: `${matchchallenge.entryfee}-${count}`,
                    amount: matchchallenge.entryfee * count,
                    total_available_amt: totalBalance - matchchallenge.entryfee * count,
                    transaction_by: constant.TRANSACTION_BY.WALLET,
                    challengeid: matchchallengeid,
                    userid: botuser._id,
                    paymentstatus: constant.PAYMENT_STATUS_TYPES.CONFIRMED,
                    bal_bonus_amt: bonus - mainbonus,
                    bal_win_amt: winning - mainwin,
                    bal_fund_amt: balance - mainbal,
                    cons_amount: mainbal,
                    cons_bonus: mainbonus,
                    cons_win: mainwin,
                    transaction_id: tranid != "" ? tranid : `${constant.APP_SHORT_NAME}-JL-${matchchallengesDataId}-${Date.now()}-${botuser._id}`,
                  };
                  await Promise.all([
                    userModel.findOneAndUpdate({ _id: botuser._id }, userObj, { new: true }),
                    TransactionModel.create(transactiondata),
                  ]);
                }
                return {
                  message: "Insufficient balance",
                  status: false,
                  data: {},
                };
              }
              tranid = `${constant.APP_SHORT_NAME}-JL-${matchchallengesDataId}-${Date.now()}-${botuser._id}`;
              const coupon = randomstring.generate({ charset: "alphanumeric", length: 4 });
              let referCode = `${constant.APP_SHORT_NAME}-${Date.now()}${coupon}`;
              if (result == 1) {
                joinedMatch = await JoinLeaugeModel.find({ matchkey: listmatchId, userid: botuser._id }).limit(1).count();
                if (joinedMatch == 0) {
                  joinedSeries = await JoinLeaugeModel.find({ seriesid: seriesId, userid: botuser._id }).limit(1).count();
                }
              }
              const joinedLeauges = await JoinLeaugeModel.find({ challengeid: matchchallengesDataId }).count();
              const joinUserCount = joinedLeauges + 1;
              if (matchchallenge.contest_type == "Amount" && joinUserCount > matchchallenge.maximum_user) {
                if (i > 1) {
                  const userObj = {
                    "userbalance.balance": balance - mainbal,
                    "userbalance.bonus": bonus - mainbonus,
                    "userbalance.winning": winning - mainwin,
                    $inc: {
                      totalchallenges: totalchallenges,
                      totalmatches: totalmatches,
                      totalseries: totalseries,
                    },
                  };
                  const transactiondata = {
                    type: "Contest Joining Fee",
                    contestdetail: `${matchchallenge.entryfee}-${count}`,
                    amount: matchchallenge.entryfee * count,
                    total_available_amt: totalBalance - matchchallenge.entryfee * count,
                    transaction_by: constant.TRANSACTION_BY.WALLET,
                    challengeid: matchchallengeid,
                    userid: botuser._id,
                    paymentstatus: constant.PAYMENT_STATUS_TYPES.CONFIRMED,
                    bal_bonus_amt: bonus - mainbonus,
                    bal_win_amt: winning - mainwin,
                    bal_fund_amt: balance - mainbal,
                    cons_amount: mainbal,
                    cons_bonus: mainbonus,
                    cons_win: mainwin,
                    transaction_id: tranid != "" ? tranid : `${constant.APP_SHORT_NAME}-JL-${matchchallengesDataId}-${Date.now()}-${botuser._id}`,
                  };
                  await Promise.all([
                    userModel.findOneAndUpdate({ _id: botuser._id }, userObj, { new: true }),
                    TransactionModel.create(transactiondata),
                  ]);
                }
                return { message: "League is Closed", status: false, data: {} };
              }
              const joinLeaugeResult = await JoinLeaugeModel.create({
                userid: botuser._id,
                challengeid: matchchallengesDataId,
                teamid: jointeamids,
                user_type: 1,
                team_type: teamType,
                matchkey: listmatchId,
                seriesid: seriesId,
                transaction_id: tranid,
                refercode: referCode,
                leaugestransaction: {
                  user_id: botuser._id,
                  bonus: resultForBonus.cons_bonus,
                  balance: resultForBalance.cons_amount,
                  winning: resultForWinning.cons_win,
                },
              });
              const joinedLeaugesCount = await JoinLeaugeModel.find({ challengeid: matchchallengesDataId }).count();
              if (result == 1) {
                totalchallenges = 1;
                if (joinedMatch == 0) {
                  totalmatches = 1;
                  if (joinedMatch == 0 && joinedSeries == 0) {
                    totalseries = 1;
                  }
                }
              }
              count++;

              if (joinLeaugeResult._id) {
                mainbal = mainbal + resultForBalance.cons_amount;
                mainbonus = mainbonus + resultForBonus.cons_bonus;
                mainwin = mainwin + resultForWinning.cons_win;
                if (
                  matchchallenge.contest_type == "Amount" &&
                  joinedLeaugesCount == matchchallenge.maximum_user &&
                  matchchallenge.is_running != 1
                ) {
                  await matchchallengesModel.findOneAndUpdate(
                    {
                      matchkey: listmatchId,
                      _id: mongoose.Types.ObjectId(matchchallengeid),
                    },
                    {
                      status: "closed",
                      joinedusers: joinedLeaugesCount,
                    },
                    { new: true }
                  );
                } else {
                  const gg = await matchchallengesModel.findOneAndUpdate(
                    {
                      matchkey: listmatchId,
                      _id: mongoose.Types.ObjectId(matchchallengeid),
                    },
                    {
                      status: "opened",
                      joinedusers: joinedLeaugesCount,
                    },
                    { new: true }
                  );
                }
              } else
                await matchchallengesModel.findOneAndUpdate(
                  {
                    matchkey: listmatchId,
                    _id: mongoose.Types.ObjectId(matchchallengeid),
                  },
                  {
                    status: "opened",
                    joinedusers: joinedLeaugesCount,
                  },
                  { new: true }
                );
              const userObj = {
                "userbalance.balance": balance - mainbal,
                "userbalance.bonus": bonus - mainbonus,
                "userbalance.winning": winning - mainwin,
                $inc: {
                  totalchallenges: totalchallenges,
                  totalmatches: totalmatches,
                  totalseries: totalseries,
                },
              };
              const transactiondata = {
                type: "Contest Joining Fee",
                contestdetail: `${matchchallenge.entryfee}-${count}`,
                amount: matchchallenge.entryfee * count,
                total_available_amt: totalBalance - matchchallenge.entryfee * count,
                transaction_by: constant.TRANSACTION_BY.WALLET,
                challengeid: matchchallengeid,
                userid: botuser._id,
                paymentstatus: constant.PAYMENT_STATUS_TYPES.CONFIRMED,
                bal_bonus_amt: bonus - mainbonus,
                bal_win_amt: winning - mainwin,
                bal_fund_amt: balance - mainbal,
                cons_amount: mainbal,
                cons_bonus: mainbonus,
                cons_win: mainwin,
                transaction_id: tranid != "" ? tranid : `${constant.APP_SHORT_NAME}-JL-${matchchallengesDataId}-${Date.now()}-${botuser._id}`,
              };
              Promise.all([
                userModel.findOneAndUpdate({ _id: botuser._id }, userObj, { new: true }),
                TransactionModel.create(transactiondata),
              ]);
              if (i == botUserNumber) {
                return {
                  message: "Contest Joined",
                  status: true,
                };
              }
            }
          }

          await this.updateJoinedusers(req.query.matchkey);
        } else {
          return {
            message: "please reduce the bot users size !!!",
            status: false,
          };
        }
      } else {
        return {
          message: "contest already full !!!",
          status: false,
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async findJoinLeaugeExist(matchkey, userId, challengeDetails) {
    const joinedLeauges = await JoinLeaugeModel.find({
      matchkey: matchkey,
      challengeid: challengeDetails._id,
      userid: userId,
    });
    if (joinedLeauges.length == 0) {
      return 1;
    }
    if (joinedLeauges.length > 0) {
      // if (challengeDetails.multi_entry == 0) {
        return 4;
      // } else {
      //   if (joinedLeauges.length >= challengeDetails.team_limit) {
      //     return 3;
      //   } else {
      //     return 2;
      //   }
      // }
    }
  }

  async findUsableBonusMoney(challengeDetails, bonus, winning, balance) {
    if (challengeDetails.is_private == 1 && challengeDetails.is_bonus != 1)
      return {
        bonus: bonus,
        cons_bonus: 0,
        reminingfee: challengeDetails.entryfee,
      };
    let totalChallengeBonus = 0;
    totalChallengeBonus =
      (challengeDetails.bonus_percentage / 100) * challengeDetails.entryfee;
    const finduserbonus = bonus;
    let findUsableBalance = winning + balance;
    let bonusUseAmount = 0;
    if (finduserbonus >= totalChallengeBonus)
      (findUsableBalance += totalChallengeBonus),
        (bonusUseAmount = totalChallengeBonus);
    else findUsableBalance += bonusUseAmount = finduserbonus;
    if (findUsableBalance < challengeDetails.entryfee) return false;
    if (bonusUseAmount >= challengeDetails.entryfee) {
      return {
        bonus: finduserbonus - challengeDetails.entryfee,
        cons_bonus: challengeDetails.enteryfee || 0,
        reminingfee: 0,
      };
    } else {
      return {
        bonus: finduserbonus - bonusUseAmount,
        cons_bonus: bonusUseAmount,
        reminingfee: challengeDetails.entryfee - bonusUseAmount,
      };
    }
  }

  async findUsableBalanceMoney(resultForBonus, balance) {
    if (balance >= resultForBonus.reminingfee)
      return {
        balance: balance - resultForBonus.reminingfee,
        cons_amount: resultForBonus.reminingfee,
        reminingfee: 0,
      };
    else
      return {
        balance: 0,
        cons_amount: balance,
        reminingfee: resultForBonus.reminingfee - balance,
      };
  }

  async findUsableWinningMoney(resultForBalance, winning) {
    if (winning >= resultForBalance.reminingfee) {
      return {
        winning: winning - resultForBalance.reminingfee,
        cons_win: resultForBalance.reminingfee,
        reminingfee: 0,
      };
    } else {
      return {
        winning: 0,
        cons_win: winning,
        reminingfee: resultForBalance.reminingfee - winning,
      };
    }
  }

  async updateJoinedusers(matchkey) {
    try {
      const query = {};
      query.matchkey = matchkey;
      query.contest_type = "Amount";
      query.status = "opened";
      const matchchallengesData = await matchchallengesModel.find(query);
      if (matchchallengesData.length > 0) {
        for (let matchchallenge of matchchallengesData) {
          const totalJoinedUserInLeauge = await JoinLeaugeModel.find({
            challengeid: mongoose.Types.ObjectId(matchchallenge._id),
          }).countDocuments();
          if (matchchallenge.maximum_user == totalJoinedUserInLeauge) {
            const update = {
              $set: {
                status: "closed",
                is_duplicated: 1,
                joinedusers: totalJoinedUserInLeauge,
              },
            };
            if (
              matchchallenge.is_running == 1 &&
              matchchallenge.is_duplicated != 1
            ) {
              delete matchchallenge._id;
              delete matchchallenge.created_at;
              delete matchchallenge.updated_at;
              matchchallenge.joinedusers = 0;
              await matchchallengesModel.insertOne(
                { matchkey: match.matchkey },
                matchchallenge
              );
            }
            await matchchallengesModel.updateOne(
              { _id: mongoose.Types.ObjectId(matchchallenge._id) },
              update
            );
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async setPercentageData(req) {
    try {
      const { hours, percentage } = req.body;
      // check hours
      const hoursExist = await botPercentageModel.findOne({ hours });
      if (hoursExist) {
        return {
          status: false,
          message: "Hours already Registered",
        };
      }
      // set percentage
      const setPercentage = new botPercentageModel({
        hours: hours,
        percentage: percentage,
      });
      const savePercentage = await setPercentage.save();
      if (savePercentage) {
        return {
          message: "percentage added successfully",
          status: true,
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async updatePercentageData(req) {
    try {
      const pquery = req.body.pquery;
      const { hours, percentage } = req.body;
      const updatePercentage = await botPercentageModel.updateOne(
        { _id: pquery },
        { percentage },
        { new: true }
      );
      if (updatePercentage) {
        return {
          message: "percentage update successfully",
          status: true,
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async joinBotUserAccordingPercentage(req) {
    try {
      const listMatches = await listMatchesModel.find({
        status: "notstarted",
        launch_status: "launched",
      });
      let today = moment().format("YYYY-MM-DD HH:mm");
      for (let listmatch of listMatches) {
        let matchChallennges = await matchChallengersModel.find({
          matchkey: mongoose.Types.ObjectId(listmatch._id),
          contest_type: { $ne: "Percentage" },
        });
        for (let matchChallennge of matchChallennges) {
          if (
            today ==
            moment(moment(listmatch.start_date).subtract("24", "hours")).format(
              "YYYY-MM-DD HH:mm"
            )
          ) {
            let botPercentage = await botPercentageModel.findOne({ hours: 24 });
            let perNum = Math.ceil(
              (matchChallennge.maximum_user - matchChallennge.joinedusers) *
              (botPercentage.percentage / 100)
            );
            await this.joinBotUser(
              (req = {
                body: {
                  bot_user_number: perNum,
                  matchchallengeid: matchChallennge._id,
                  cType: matchChallennge.c_type,
                },
              })
            );
          }

          if (
            today ==
            moment(moment(listmatch.start_date).subtract("12", "hours")).format(
              "YYYY-MM-DD HH:mm"
            )
          ) {
            let botPercentage = await botPercentageModel.findOne({ hours: 12 });
            let perNum = Math.ceil(
              (matchChallennge.maximum_user - matchChallennge.joinedusers) *
              (botPercentage.percentage / 100)
            );
            await this.joinBotUser(
              (req = {
                body: {
                  bot_user_number: perNum,
                  matchchallengeid: matchChallennge._id,
                  cType: matchChallennge.c_type,
                },
              })
            );
          }

          if (
            today ==
            moment(moment(listmatch.start_date).subtract("6", "hours")).format(
              "YYYY-MM-DD HH:mm"
            )
          ) {
            let botPercentage = await botPercentageModel.findOne({ hours: 6 });
            let perNum = Math.ceil(
              (matchChallennge.maximum_user - matchChallennge.joinedusers) *
              (botPercentage.percentage / 100)
            );
            await this.joinBotUser(
              (req = {
                body: {
                  bot_user_number: perNum,
                  matchchallengeid: matchChallennge._id,
                  cType: matchChallennge.c_type,
                },
              })
            );
          }

          if (
            today ==
            moment(
              moment(listmatch.start_date).subtract("0.5", "hours")
            ).format("YYYY-MM-DD HH:mm")
          ) {
            let botPercentage = await botPercentageModel.findOne({
              hours: 0.5,
            });
            let perNum = Math.ceil(
              (matchChallennge.maximum_user - matchChallennge.joinedusers) *
              (botPercentage.percentage / 100)
            );
            await this.joinBotUser(
              (req = {
                body: {
                  bot_user_number: perNum,
                  matchchallengeid: matchChallennge._id,
                  cType: matchChallennge.c_type,
                },
              })
            );
          }

          if (
            today == moment(listmatch.start_date).format("YYYY-MM-DD HH:mm")
          ) {
            if (matchChallennge.joinedusers >= 1) {
              let perNum =
                matchChallennge.maximum_user - matchChallennge.joinedusers;
              await this.joinBotUser(
                (req = {
                  body: {
                    bot_user_number: perNum,
                    matchchallengeid: matchChallennge._id,
                    cType: matchChallennge.c_type,
                  },
                })
              );
            }
          }
        }
      }
      if (listMatches) {
        return {
          status: true,
          data: listMatches,
        };
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new botUserService();
