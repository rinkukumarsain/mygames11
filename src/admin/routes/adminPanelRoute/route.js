//Required Packages
const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../../../middlewares/adminauth");
const getUrl = require("../../../middlewares/geturl");
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        console.log("multer-----------------", req.body.typename);
        cb(null, `public/${req.body.typename}`);
    },
    filename: function(req, file, cb) {
        let exe = file.originalname.split(".").pop();
        let filename = `${Date.now()}.${exe}`;
        cb(null, filename);
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) =>  {
    if (
        file.mimetype == "image/png" ||
        file.mimetype == "image/jpg" ||
        file.mimetype == "image/jpeg"
      ) {
        cb(null, true);
      } else {
        req.fileValidationError = "Only .png, .jpg and .jpeg format allowed!";
        return cb(null, false, req.fileValidationError);
        // cb(null,false);
        // return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
      }
    },
});

const adminPanelController = require("../../controller/adminController");
const dashboardController = require("../../controller/dashbordController");
const seriesController = require("../../controller/seriesController");
const matchController = require("../../controller/matchController");
const teamsController = require("../../controller/teamController");
const offerController = require("../../controller/offerController");
const pointController = require("../../controller/pointController");
const pointSystemController = require("../../controller/poinSystemController");
const cricketApiController = require("../../controller/cricketApiController");
const contestcategoryController = require("../../controller/contestCategoryController");
const challengersController = require("../../controller/challengersController");
const seriesDetailsController = require("../../controller/seriesDetailsController");
const playersController = require("../../controller/playersController");
const subAdminController = require("../../controller/subAdminController");
const userManagerController = require("../../controller/userManagerController");
const youtuberController = require("../../controller/youtuberController");
const adminController = require("../../controller/adminController");
const verifyManagerController = require('../../controller/verifyPanController');
const botcontroller = require('../../controller/botController');
const resultController = require("../../controller/resultController");
const notificationController=require("../../controller/notificationController");
const receivefundController=require("../../controller/receivefundController");
const leaderboardController=require("../../controller/leaderboardController");
const popupNotificationController=require("../../controller/popupNotificationController");


router.get("/", auth, getUrl, dashboardController.showdashboard);
router.post("/total_amount_withdraw_in_week", dashboardController.totalAmountWithdrawInWeek);
router.post("/total_amount_received_in_week",dashboardController.totalAmountReceivedInWeek);

// --------------admin ----------------

router.get("/register-admin", adminPanelController.registerAdminPage);
router.post("/register-admin-data", adminPanelController.registerAdminData);

router.get("/login-admin", adminPanelController.loginAdminPage);
router.post("/login-admin-data", adminPanelController.loginAdminData);

router.get("/admin_profile_page",auth, getUrl,adminPanelController.adminProfilePage);
router.post("/admin_profile_data/:id",auth, getUrl,upload.single('image'),adminPanelController.updateProfileData);
//  ----------------------------------              botcontroller         ---------------------------


router.post('/demo', botcontroller.createMyTeam);


//  ----------------------------------              botcontroller         ---------------------------




// ---SERIES MODULE----//
router.get("/add-series", auth, getUrl, seriesController.Series_page);
router.post("/add-series", auth, seriesController.addSeries);
router.get("/view-series", auth, getUrl, seriesController.viewSeries);
router.post("/series-Data-Table", auth, seriesController.seriesDataTable);
router.get("/edit-series/:id", auth, getUrl, seriesController.edit_Series);
router.post("/edit-series-data/:id", auth, seriesController.editSeriesData);
router.get("/update-series-status/:id", auth, getUrl, seriesController.updateStatusforSeries);

// ---TEAM MODULE----//

router.get("/view-teams", auth, getUrl, teamsController.viewTeams);
router.post("/teams-Data-Table", auth, teamsController.teamsDataTable);
router.get("/edit-Team/:id", auth, getUrl, teamsController.editTeam);
router.post("/edit-Team-Data/:id", auth, upload.single("logo"), teamsController.edit_Team_Data);

// ---MATCH MODULE----//


router.get('/view_AllUpcomingMatches', auth, getUrl, matchController.view_AllUpcomingMatches);
router.post('/view_AllUpcomingMatches-data-table', auth, matchController.view_AllUpcomingMatches_table);
router.get("/add-match_page",auth,matchController.addMatchPage);
router.post("/add-match-data",auth,matchController.addMatchData);
router.get('/edit-match/:id', auth, getUrl, matchController.edit_Match);
router.post('/edit-match-data/:id', auth, matchController.edit_match_data);
router.get('/view-AllMatches', auth, getUrl, matchController.view_AllMatches);
router.post('/view-AllMatches-data-table', auth, matchController.view_AllMatches_table);
router.get('/launch-match/:id', auth, getUrl, matchController.launch_Match);
router.get('/launch/:id', auth, getUrl, matchController.launch);
router.post("/launchMatch-changeTeamLog/:teamId", upload.single('logo'), matchController.launchMatchChangeTeamLogo);
router.get('/update-playing11', auth, getUrl, matchController.updatePlaying11);
router.post('/update-playing11-team1-table', auth, matchController.updatePlaying11Team1Data);
router.post('/update-playing11-team2-table', auth, matchController.updatePlaying11Team2Data);
router.post('/update-playing11-team1', auth, matchController.updateTeam1Playing11);
router.post('/update-playing11-team2', auth, matchController.updateTeam2Playing11);
router.post('/update-playing11-launch', auth, matchController.updatePlaying11Launch);
router.get("/unlaunch/:id",matchController.unlaunchMatch);
router.post("/launchMatch-changeTeamLog/:teamId", auth,upload.single('logo'), matchController.launchMatchChangeTeamLogo);
router.post("/launchMatchPlayerUpdate/:playerId",auth,upload.single('logo'),matchController.launchMatchPlayerUpdateData);
router.get("/matchPlayerDelete",auth,matchController.matchPlayerDelete);

// -------  USER MODULE   ----- //

router.get('/view_all_users', auth, getUrl, userManagerController.view_AllUsers);
router.post('/view_users_datatable', auth, userManagerController.view_users_datatable);
router.get('/blockUser/:id', auth, getUrl, userManagerController.blockUser);
router.get('/unblockuser/:id', auth, getUrl, userManagerController.unBlockUser);
router.get('/viewtransactions/:id', auth, getUrl, userManagerController.viewtransactions);
router.post('/viewTransactions-Data-Table/:id', auth, userManagerController.viewTransactionsDataTable);
router.get('/editUserDetails-page/:id', auth, getUrl, userManagerController.editUserDetails_page);
router.post('/edituserdetails', auth, upload.single('image'), userManagerController.edituserdetails);
router.get('/userswallet', auth, getUrl, userManagerController.userswallet);
router.post('/userswallet_table', auth, userManagerController.userswallet_table);
router.get('/wallet-list', auth, getUrl, userManagerController.wallet_list);
router.get('/adminwallet', auth, getUrl, userManagerController.adminwallet);
router.get('/getUserDetails/:id', auth, getUrl, userManagerController.getUserDetails);
router.post('/addMoneyInWallet', auth, userManagerController.addmoneyinwallet);
router.post('/deductmoneyinWallet', auth, userManagerController.deductmoneyinwallet);
router.post('/adminwallet-dataTable', auth, userManagerController.adminwallet_dataTable);
router.get("/downloadalluserdetails/:id",auth,userManagerController.downloadalluserdetails);

//----------verifyManager--------//

router.get("/verifypan", auth, getUrl, verifyManagerController.verifyPan);
router.post("/verifypan-datatable", auth, verifyManagerController.verifyPan_Datatable);
router.get("/viewpandetails/:id", auth, getUrl, verifyManagerController.viewPan_Details);
router.post("/modifyPanDetails", auth, verifyManagerController.update_Pan_Details);
router.get("/editPandetails/:id", auth, getUrl, verifyManagerController.editPan_Details);
router.post("/Update-Credentials-Pan", auth, verifyManagerController.Update_Credentials_Pan);
router.get("/verifybankaccount", auth, getUrl, verifyManagerController.verifyBank);
router.post("/verifyBank_datatable", auth, verifyManagerController.verifyBank_Datatable);
router.get("/viewbankdetails/:id", auth, getUrl, verifyManagerController.viewBank_Details);
router.get("/editbankdetails/:id", auth, getUrl, verifyManagerController.editBank_Details);
router.get("/withdraw_amount", auth, getUrl, verifyManagerController.withdrawalAmount);
router.post("/withdraw-amount-datatable", auth, verifyManagerController.withdraw_amount_datatable2);
router.post("/modifyBankDetails", auth, verifyManagerController.update_Bank_Details);
router.post("/Update-Credentials-Bank", auth, verifyManagerController.Update_Credentials_Bank);
router.get("/approve-withdraw-request/:id", auth, getUrl, verifyManagerController.approve_withdraw_request);
router.get("/reject-withdraw-request/:id", auth, getUrl, verifyManagerController.reject_withdraw_request);

// ---------General Manegar------//

router.get("/view-general-tab", auth, getUrl, adminPanelController.viewGeneralTab);
router.post("/general-tab-data/:id", auth, adminPanelController.generalTabData);
router.post("/generalTabData-table", auth, adminPanelController.generalTabTable);
router.get("/general_delete", auth, getUrl, adminPanelController.generalTabDelete);

//-----------banner----------------//

router.get("/add-banner", auth, getUrl, adminPanelController.addBanner);
router.post("/add-banner-Data", auth, upload.single("image"), adminPanelController.addBannerData);
router.get("/view-all-Banner", auth, getUrl, adminPanelController.viewallBanner);
router.post("/view-all-sideBanner", auth, adminPanelController.viewAllSideBanner);
router.get("/edit-sideBanner", auth, getUrl, adminPanelController.editSideBanner);
router.post("/edit-banner-Data", auth, upload.single("image"), adminPanelController.editBannerData);
router.get("/delete-sideBanner", auth, getUrl, adminPanelController.deleteSideBanner);

// -----------------------offer----------------------------

router.get("/add-offer", auth, getUrl, offerController.addOffer);
router.post("/add-offer-data", auth, offerController.addOfferData);
router.get("/view-all-offer", auth, getUrl, offerController.viewAllOffer);
router.post("/viewAllOffer-data-table", auth, offerController.viewAllOfferDataTable);
router.get("/editoffers", auth, getUrl, offerController.editoffers_page);
router.post("/edit-offer-data", auth, offerController.editOfferData);
router.get("/deleteoffers", auth, getUrl, offerController.deleteoffers);

// -------------------------point System ------------------------------

router.get("/pointSystem", auth, getUrl, pointSystemController.pointSystem);
router.post("/update_point_system", auth, pointSystemController.updatePointSystem);

//-------------------point------------------

router.get("/point", auth, getUrl, pointController.point_page);
router.post("/add-point-data", auth, pointController.addPointData);

// --------------------contestcategory----------------------------

router.get("/view-contest-Category", auth, getUrl, contestcategoryController.contestCategoryPage);
router.get("/create-contest-category", auth, getUrl, contestcategoryController.createContestCategory);
router.post("/add-contest-category-data", auth, upload.single("image"), contestcategoryController.addContestCategoryData);
router.post("/contest-Category-table", auth, contestcategoryController.contestCategoryTable);
router.get("/edit-contest-category", auth, getUrl, contestcategoryController.editContestCategory);
router.post("/edit-contest-category-data/:contestId", upload.single("image"), auth, contestcategoryController.editContestCategoryData);
router.get("/delete-contest-category", auth, getUrl, contestcategoryController.deleteContestCategory);

//---------------------global challengers--------------------------

router.get('/view-all-global-contests-challengers', auth, getUrl, challengersController.viewGlobleContests_page);
router.get("/add-global-contest-challengers", auth, getUrl, challengersController.addGlobalContest_page);
router.post("/add-global-contest-challengers-data", auth, challengersController.addGlobalchallengersData);
router.post("/global-challengers-datatable", auth, challengersController.globalChallengersDatatable);
router.get("/edit-global-contest-challengers/:id", auth, getUrl, challengersController.editglobalcontest_page);
router.post("/edit-global-contest-data", auth, challengersController.editGlobalContestData);
router.get("/delete-global-challengers", auth, getUrl, challengersController.deleteGlobalChallengers);
router.post("/delete-multi-global-challengers", auth, challengersController.globalcatMuldelete);
router.get("/addpricecard/:id", auth, getUrl, challengersController.addpricecard_page);
router.post("/add-price-card-Post", auth, challengersController.addpriceCard_Post);
router.post("/add-price-card-Post-byPercentage", auth, challengersController.addpricecardPostbyPercentage);
router.get("/deletepricecard/:id", auth, getUrl, challengersController.deletepricecard_data);

// -------------------------custom contest---------------------

router.get("/create-custom-contest", auth, getUrl, challengersController.createCustomContest);
router.get("/importmatchData/:matchKey", auth, getUrl, challengersController.importchallengersData);
router.get("/create_Match_custom", auth, getUrl, challengersController.create_custom_page);
router.post("/add_custom_contest_data", auth, challengersController.addCustom_contestData);
router.get("/editcustomcontest/:MatchChallengerId", auth, getUrl, challengersController.editcustomcontest_page);
router.post("/editcustomcontest/:MatchChallengerId", auth, challengersController.editcustomcontest_data);
router.get("/delete_customcontest/:MatchChallengerId", auth, getUrl, challengersController.delete_customcontest);
router.get("/makeConfirmed/:MatchChallengerId", auth, getUrl, challengersController.makeConfirmed);
router.get("/addEditmatchpricecard/:MatchChallengerId", auth, getUrl, challengersController.addEditmatchpricecard);
router.post("/add-edit-price-card-Post", auth, challengersController.addEditPriceCard_Post);
router.get("/deleteMatchPriceCard/:id", auth, getUrl, challengersController.deleteMatchPriceCard);
router.post('/add-edit-price-card-Post-byPercentage', auth, challengersController.addEditPriceCardPostbyPercentage)

// -----------------------------series Details-------------------

router.get("/seriesDetails", auth, getUrl, seriesDetailsController.seriesDetails_Page);
router.post("/getFullSeriesDataTable", auth, seriesDetailsController.getFullSeriesDataTable_Page);

//---------------------------- --player manager------------------

router.get('/view-all-players', auth, getUrl, playersController.viewAllPlayer);
router.post('/view_player_datatable', auth, playersController.view_player_datatable);
router.get("/edit_player/:playerId", auth, getUrl, playersController.edit_player);
router.post("/edit_player_data/:playerId", auth, upload.single('image'), playersController.edit_player_data);
router.post("/saveplayerroles", auth, playersController.saveplayerroles);


//--------------------------------Youtuber-----------------------
router.get("/add_youtuber", auth, getUrl, youtuberController.add_youtuber);
router.post("/add_youtuber_data", auth, youtuberController.add_youtuber_data);
router.post("/view_youtuber_dataTable", auth, youtuberController.view_youtuber_dataTable);
router.get("/view_youtuber", auth, getUrl, youtuberController.view_youtuber);
router.get("/edit_youtuber/:youtuberId", auth, getUrl, youtuberController.edit_youtuber);
router.post("/edit_youtuber/:youtuberId", auth, youtuberController.edit_youtuber_data);
router.get("/delete_youtuber/:youtuberId", auth, getUrl, youtuberController.delete_youtuber);

// -------------------------Receive Fund----------
router.get("/view_all_Receive_Fund",receivefundController.viewallReceiveFund);
router.post("/view_all_Receive_Fund_datatable",receivefundController.viewAllReceiveFundDatatable);


// ----------------------------- sub admin -------------------------
router.get("/add-sub-admin", auth, getUrl, subAdminController.addSubAdminPage);
router.post("/add-sub-admin-data", auth, subAdminController.addSubAdminData);
router.get("/view-sub-admin", auth, getUrl, subAdminController.viewSubAdminPage);
router.post("/view-sub-admin-table", auth, subAdminController.viewSubAdminData);
router.get("/view-permissions/:id", auth, getUrl, subAdminController.viewPermisionPage);
router.get('/update-sub-admin/:id', auth, getUrl, subAdminController.updateSubAdminPage);
router.post('/update-sub-admin-data/:id', auth, subAdminController.updateSubAdmin);
router.get('/delete-sub-admin/:id', auth, getUrl, subAdminController.deleteSubAdmin);

// ----------------------------- logout -------------------------
router.post("/logout", auth, adminController.logout);

// ------------------------- change password ------------------------
router.get("/change-password", auth, getUrl, adminController.changePasswordPage);
router.post("/change-password-data", auth, adminController.changePassword);

// ------------------------- result controller route ------------------------

//Cron don't add auth and getUrl function
router.get("/update_results_of_matches", resultController.update_results_of_matches)
router.get("/refund_amount", resultController.refund_amount)


router.get("/match-result", auth, getUrl, resultController.matchResult);
router.post("/match-result-table", auth, resultController.matchResultData);
router.get("/match-details/:id", auth, getUrl, resultController.matchDetails);
router.post("/match-details-table/:id", auth, resultController.matchDetailsData);
router.get("/allcontests/:id", auth, getUrl, resultController.matchAllcontests);
router.post("/allcontests-table/:id", auth, resultController.matchAllcontestsData);
router.get("/match-score/:id", auth, getUrl, resultController.matchScore);
router.get("/match-points/:id", auth, getUrl, resultController.matchPoints);
router.get("/batting-points/:id", auth, getUrl, resultController.battingPoints);
router.get("/bowling-points/:id", auth, getUrl, resultController.bowlingPoints);
router.get("/fielding-points/:id", auth, getUrl, resultController.fieldingPoints);
router.get("/team-points/:id", auth, getUrl, resultController.teamPoints);
router.post("/match-score-table/:id", auth, resultController.matchScoreData);
router.post("/match-points-table/:id", auth, resultController.matchPointsData);
router.post("/batting-points-table/:id", auth, resultController.battingPointsData);
router.post("/bowling-points-table/:id", auth, resultController.bowlingPointsData);
router.post("/fielding-points-table/:id", auth, resultController.fieldingPointsData);
router.post("/team-points-table/:id", auth, resultController.teamPointsData);
router.get('/contest-user-details/:matchkey', auth, getUrl, resultController.contestUserDetails);
router.post('/contest-user-details-table/:matchkey', auth, resultController.contestUserDetailsData);
router.post("/updateMatchFinalStatus/:id/:status", auth, resultController.updateMatchFinalStatus);
router.get("/user-teams", auth, getUrl, resultController.viewTeams);
router.post("/user-teams-table", auth, resultController.viewTeamsData);

// -----------------------popup notification-------------------

router.get("/popup", auth, getUrl, popupNotificationController.popup);
router.post("/popup-data", auth, popupNotificationController.popupData);
router.get("/add-popup", auth, getUrl, popupNotificationController.addPopup);
router.get("/delete-popup", auth, popupNotificationController.deletePopup);
router.post("/add-popup-data", auth, upload.single("image"), popupNotificationController.addPopupData);


// --------------------notification---------------

router.get("/pushNotification",auth,notificationController.pushNotification);
router.get("/emailNotification",auth,notificationController.emailNotification);

// --------------------------leaderBoard------------------
router.get("/view_leaderBoard_page",leaderboardController.viewLeaderBoarderPage);
router.post("/view_leaderBoard_datatable",leaderboardController.viewLeaderBoardDatatable);
router.get("/add_series_pricecard_page/:id",leaderboardController.addSeriesPriceCardPage);
router.post("/add-series-price-card-Post",leaderboardController.addSeriesPriceCardData);
router.get("/delete_series_pricecard/:id",leaderboardController.deleteSeriesPriceCard);
router.post("/distribute_winning_amount_series_leaderboard/:id",leaderboardController.distributeWinningAmountSeriesLeaderboard);


//-----cricket api controller (3rd party api)------------//
// router.get("/listMatches", cricketApiController.listOfMatches);
router.get("/listMatches", auth, cricketApiController.listOfMatches_entity);
router.get("/importPlayers/:matchkey", cricketApiController.fetchPlayerByMatch_entity);

module.exports = router;