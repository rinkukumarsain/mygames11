const res = require('express/lib/response');
const mongoose = require('mongoose');
const randomstring = require("randomstring");
const listMatchesModel=require("../../models/listMatchesModel");
const seriesModel=require("../../models/addSeriesModel");

class seriesDetails {
constructor() {
    return {
        seriesList:this.seriesList.bind(this),
    }
}
// --------------------
async seriesList(req){
    try{
        
        const seriesListData=await seriesModel.find({},{name:1});
        return seriesListData;

    }catch(error){
        throw error;
    }
}



}
module.exports = new seriesDetails();


