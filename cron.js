const express = require("express");
const mongoose = require('mongoose');

// coustimize the default console.log function 
console.logCopy = console.log.bind(console);
console.log = function(...data){
    const currentDate = '[' + new Date().toString() + ']';
    this.logCopy(`----///  THIS IS CRON PORT   ////----${currentDate}--------`,...data);
}

const app = express();

require('dotenv').config();
require("./src/db/dbconnection");
const constant = require('./src/config/const_credential');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// mongoose.set('debug', true);


const { updatePlayerSelected, updateResultOfMatches, botUserJoinTeamPercentage, botAutoClassicTeam, botAutoBattingTeam, botAutoBowlingTeam, botAutoReverseTeam, generateRandomPlayerClassic, generateRandomPlayerBatting, generateRandomPlayerBowling, generateRandomPlayerReverse, autoWinnerDeclared } = require('./src/config/cronjob');
// updatePlayerSelected.start();
// updateResultOfMatches.start();
// autoWinnerDeclared.start();
// botUserJoinTeamPercentage.start();
// botAutoClassicTeam.start();
// botAutoBattingTeam.start();
// botAutoBowlingTeam.start();
// botAutoReverseTeam.start();
// generateRandomPlayerClassic.start();
// generateRandomPlayerBatting.start();
// generateRandomPlayerBowling.start();
// generateRandomPlayerReverse.start();

const adminRouter = require("./src/admin/routes/adminPanelRoute/route");
app.use("/", adminRouter);

const errorRoute = require("./src/admin/routes/adminPanelRoute/errorRoute");
app.use(errorRoute);

const port = constant.CRON_PORT;

app.listen(port, () => {
    console.log(`server started on port ${port}`);
});