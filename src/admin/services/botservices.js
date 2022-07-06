const mongoose = require('mongoose');

const userModel = require('../../models/userModel');
const listMatchesModel = require('../../models/listMatchesModel');
const SeriesModel = require('../../models/addSeriesModel');
const matchPlayersModel = require('../../models/matchPlayersModel');
const playersModel = require('../../models/playerModel');
const teamModel = require('../../models/teamModel');
const JoinTeamModel = require('../../models/JoinTeamModel');



class botServices {
    constructor() {
        return {
            createMyTeam:this.createMyTeam.bind(this),
            findData:this.findData.bind(this),
            shuffle:this.shuffle.bind(this)
        }
    }



    async findData(req){
        try {
            for (let values of req) {
                let pipeline = [];
                pipeline.push({
                    $match:  { matchkey: mongoose.Types.ObjectId(values._id)},
                })
                pipeline.push({
                    $lookup: {
                        from: 'players',
                        localField: 'playerid',
                        foreignField: '_id',
                        as: 'playersData'
                    }
                })
                pipeline.push({
                    $unwind: { path: "$playersData" }
                })
                pipeline.push({
       $project : { matchkey:1 ,playerid:1,credit : 1, role:1 , team : '$playersData.team', player_name:'$playersData.player_name',playingstatus:1 }    
                })
                let result = await matchPlayersModel.aggregate(pipeline);
                return{
                    status:true,
                    data:result
                }
            }
        } catch (error) {
            throw error;
        }
    }

    async shuffle(req){
        try {
                let currentIndex = req.length,  randomIndex;
              
                // While there remain elements to shuffle...
                while (currentIndex != 0) {
              
                  // Pick a remaining element...
                  randomIndex = Math.floor(Math.random() * currentIndex);
                  currentIndex--;
              
                  // And swap it with the current element.
                  [req[currentIndex], req[randomIndex]] = [
                    req[randomIndex], req[currentIndex]];
               
              
                return {
                    status:true,
                    data:req,

                }
              }
              
        } catch (error) {
            throw error;
        }
    }
    async createMyTeam(req) {
        try {
            const findLaunchedMatch = await listMatchesModel.find({launch_status:'launched'});
            let  teamAid = findLaunchedMatch[0].team1Id;
             let teamBid = findLaunchedMatch[0].team2Id;
           let batcount=0;
           let bollcount=0;
           let keepercount=0;
           let allcount=0;
            let temaAplayers=0;
            let temaBplayers=0;
            let allBowlers=[];
            let allKeepers=[];
            let allRounders=[];
            let batsaMan=[];
            let mainArray=[]
            let onlyforallrounder=0;
            let onlyforBatsman=0;
            let onlyforbowler=0;
            let credit = 0;
            if(findLaunchedMatch.length==0){
                return{
                    status:false,
                    data:'no data found',
                }
            }else{
               const data = await this.findData(findLaunchedMatch);
               if(data.status==false){
                  return{
                    status:false,
                    data:'something went wrong please try again',
                  } 
               }else{
                   //for generating random values 
               const randomData = await  this.shuffle(data.data);
                      for (let values of randomData.data) {
                        credit+=values.credit;
                      if(credit>100){
                         break;
                         }else{
                            for (let values of data.data) {
                            if(values.role=="keeper" && keepercount<1) {
                                 if(values.credit>9){
                                    break;
                                }else{
                                    if(teamAid.toString()==values.team.toString()){
                                        temaAplayers++;
                                    }else{
                                        temaBplayers++;
                                    }
                                     keepercount++;
                                     console.log("keeper",keepercount,"team a=",temaAplayers,"team b=",temaBplayers)
                                    allKeepers.push(mongoose.Types.ObjectId(values.playerid));
                                      }
                                }
                                if(values.role=="allrounder" && allcount<2){
                                    if(values.credit>9){
                                        break;
                                    }else{
                                         if(teamAid.toString()==values.team.toString() && onlyforallrounder<=1){  
                                            onlyforallrounder++;
                                            temaAplayers++;
                                        }else{
                                            temaBplayers++;
                                        } 
                                    allcount++;
                                    allRounders.push(mongoose.Types.ObjectId(values.playerid));
                                    }       
                               }
                             if(values.role == "batsman" && batcount<4){
                                    if(values.credit>9){
                                       break;
                                   }else{
                                    if(teamAid.toString()==values.team.toString() && onlyforBatsman<2){
                                        onlyforBatsman++;
                                        temaAplayers++;
                                    }else{
                                        temaBplayers++;
                                    }
                                    batcount++;
                                    console.log("batsman",batcount,"team a",temaAplayers,"team b",temaBplayers);
                                        batsaMan.push(mongoose.Types.ObjectId(values.playerid));
                                           }
                                   }
                                   if(values.role == "bowler" && bollcount<4){
                                    if(values.credit>9){
                                       break;
                                   }else{
                                    if(teamAid.toString()==values.team.toString() && onlyforbowler<2){
                                        onlyforbowler++;
                                        temaAplayers++;
                                    }else{
                                        temaBplayers++;
                                    }
                                    bollcount++;
     console.log("batsman",batcount,"bowler",bollcount,"keeper",keepercount,"all rounder",allcount,"team a",temaAplayers,"team b",temaBplayers);
                                    allBowlers.push(mongoose.Types.ObjectId(values.playerid));
                                         }
                                   }    
                                }
                            }
                        }
                        mainArray.push(...allRounders,...allBowlers,...allKeepers,...batsaMan);
                return{
                    status:true,
                    data:mainArray
                   }
               }
            }
          
          
                        // if(values.team.toString()==findLaunchedMatch[0].team1Id.toString()){
                        //     temaAplayers.push(values.player_name);
                        // }
                        // if(values.team.toString()==findLaunchedMatch[0].team2Id.toString()){
                        // temaBplayers.push(values.player_name);
                        // }
                        //     for(let value of temaAplayers){
                        //         if(insertbowler.length==11 && credit<=100){
                        //             return{
                        //                 status:false,
                        //                 data:`limit has been reached`,insertbowler,credit
                        //             }
                        //         }
                        //         else{
                        //                 const data =  await playersModel.find({player_name:temaAplayers});
                        //         //    data.includes(rolesOfPlayer=>{
                        //         //        console.log(rolesOfPlayer)
                        //         //     //    if(rolesOfPlayer.role=="bowler"){
                        //         //     //     insertbowler.push(entry.player_name);
                        //         //     //     credit += entry.credit;
                        //         //     //    }
                        //         //    })    
                                       
                        //                 for(let entry of data){
                        //                     insertbowler.push(entry.player_name);
                        //                     credit += entry.credit;
                        //                     }
                        //                 console.log(insertbowler,credit)
                        //         }
                        //     }
          
          
          
          
          
          
          
            // if(!findLaunchedMatch){
            //     return{
            //         status:false,
            //         data:'no launch match found',
            //     }
            // }
            // else{
            //     let pipeline = [];
            //     pipeline.push({
            //         $match:  { matchkey: mongoose.Types.ObjectId(findLaunchedMatch._id)},
            //     })
            //     pipeline.push({
            //         $lookup: {
            //             from: 'players',
            //             localField: 'playerid',
            //             foreignField: '_id',
            //             as: 'playersData'
            //         }
            //     })
            //     pipeline.push({
            //         $unwind: { path: "$playersData" }
            //     })
            //     pipeline.push({
            //          $project : { matchkey:1 ,playerid:1,credit : 1, role:1 , team : '$playersData.team', player_name:'$playersData.player_name',playingstatus:1 }    
            //     })
            //     let result = await matchPlayersModel.aggregate(pipeline);
            //     console.log(result.length)
            //     const value1 = result.some(id => id.team.toString() ==findLaunchedMatch.team1Id.toString());
            //     const value2 = result.some(id => id.team.toString() ==findLaunchedMatch.team2Id.toString());
            //     let arrb=[];
            //     let arr=[];
            //     let credit=0;
            //     if(value1){
            //         const findplayersA = await playersModel.find({team:findLaunchedMatch.team1Id});
            //         console.log( findplayersA);
            //         for (const value in findplayersA) {
            //             console.log(findplayersA);
            //             if(findplayersA[value].role=="keeper"){
            //                 console.log(findplayersA[value])
            //                 if(arr.length>6){
            //                  return{
            //                      status:false,
            //                     data:'limit has been reached',
            //                  }   
            //                 }
            //                  else{
            //                     console.log(findplayersA[value])
                            
            //                     while (arr.length<6) {
            //                         console.log(findplayersA[value].player_name)
            //                         arr.push(findplayersA[value].player_name);
            //                         credit+=findplayersA[value].credit;
            //                     }
            //                     return{
            //                         status:true,
            //                         data:arr,credit,
            //                      }
            //                 }
            //              }
            //           }
            //         }
                   
            //    console.log(arr)
            //    if(value2){
            //     const findplayersB = await playersModel.find({team:findLaunchedMatch.team2Id});
            //     for (const value in findplayersB)
            //     arrb.push(findplayersB[value].player_name);
            //    }
            //    console.log(arrb);
















                // result.includes(value=>{
                //     console.log(value)
                //     if(value.team.toString()==findLaunchedMatch.team1Id.toString()){
                //         return console.log("done")
                //     }else if(value.team.toString()==findLaunchedMatch.team1Id.toString()){
                //         return console.log("another")
                //     }
                // })
                // for(let x=0;x<=result.length-1;x++){
                //          if(result[x].team.toString()==findLaunchedMatch.team1Id.toString()){
                //             const findplayersA = await playersModel.find({team:findLaunchedMatch.team1Id}).countDocuments();
                //             console.log(findplayersA);
                //         }else{
                //          const findplayersB = await playersModel.find({team:findLaunchedMatch.team2Id}).countDocuments();
                //         console.log(findplayersB)
                //         }
                // result.forEach(async(value) => {
                //     if(value.team.toString()==findLaunchedMatch.team1Id.toString()){
                //         const findplayersA = await playersModel.find({team:value.team}).countDocuments()
                //     //   const findplayersA = await playersModel.find({team:findLaunchedMatch.team1Id});
                //     console.log(findplayersA)
                //         let playersArr= [];
                //         let credit =0;
                       
                        // if(findplayersA.role=="keeper"){
                        //     if(playersArr.length==11){
                        //         return{
                        //             status:false,
                        //             data:`team full better luck next time`,
                        //         }
                        //     }else{
                        //         while (playersArr.length >= 3 || playersArr.length < 6){
                        //              playersArr.push(findplayersA)
                        //             }
                        //         return {
                        //             status:true,
                        //             data:'you have reached maximam limit for bowlers',
                        //         }
                        //     }

                        // }
                    //    }
                    //    else{
                    //     const findplayersB = await playersModel.find({team:value.team}).countDocuments();
                    //     console.log(findplayersB)
                    //     // const findplayersB = await playersModel.find({team:value.team})
                    //    }
                    // });
                // }


               
            //    return{
            //        status:true,
            //        data:result
            //    }
               
            // }


        } catch (error) {
            throw error;
        }
    }

}
module.exports = new botServices();

