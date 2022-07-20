//Required Packages
const express = require('express');
const router = express.Router();
const multer = require('multer');

const userController = require('../controller/userController');
const MatchController = require('../controller/matchController');
const ContestController = require('../controller/ContestController');
const CronJob = require('../services/cronJobServices');

const auth = require('../../middlewares/apiauth');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        console.log('multer-----------------', req.body.typename);
        console.log('multer-----------------', req.body);
        cb(null, `public/${req.body.typename}`)
    },
    filename: function(req, file, cb) {
        let exe = (file.originalname).split(".").pop();
        let filename = `${Date.now()}.${exe}`;
        cb(null, filename)
    }
})

const upload = multer({
    storage: storage,
    // fileFilter: (req, file, cb) => {
    // if (file.mimetype == "image/png") {
    //   cb(null, true);
    // } else {
    //   cb(null, false);
    //   return cb(new Error('Only .png format allowed!'));
    // }
    //   }
}, );

/**
 *  @author Devanshu Gautam
 *  @description user controller route
 */

router.get('/', auth, (req, res) => {
    res.send('working')
});
//Temporary Registration of User And OTP to Them
router.post('/add-tempUser', userController.addTempuser);

//Registration of User and Check the Verification code
router.post('/add-user', userController.registerUser);

//User Login
router.post('/login', userController.loginuser);

//User Logout
router.post('/logout', auth, userController.logoutUser);

//if Mobile Use for login then call the login OTP
router.post('/login-otp', userController.loginuserOTP);

//Get Version API for the Android and IOS
router.get('/getversion', userController.getVersion);

//Get Main Banner for App
router.get('/getmainbanner', userController.getmainbanner);

//Get Slide Banner for App
router.get('/webslider', userController.getwebslider);

// Save Image Url of User
router.post('/imageUploadUser', auth, upload.single('image'), userController.uploadUserImage);

//Resend OTP
router.post('/resendotp', userController.resendOTP);

// Send Otp on mobile for mobile verification
router.post('/verifyMobileNumber', auth, userController.verifyMobileNumber);

// Send Otp on Email for email verification
router.post('/verifyEmail', auth, userController.verifyEmail);

// Verifiy the email and mobile from OTP
router.post('/verifyCode', auth, userController.verifyCode);

// Get User all verifivcation Details
router.get('/allverify', auth, userController.allverify);

// Get User Full Details
router.get('/userfulldetails', auth, userController.userFullDetails);

//Get User Transaction
router.get('/mytransactions', auth, userController.myTransactions);

//Get User Transaction
// router.get('/mytransactionsold', auth, userController.myOldTransactions);

// Edit Profile of User
router.post('/editprofile', auth, userController.editProfile);

// Forgot password to send OTP for vaild user
router.post('/forgotpassword', userController.forgotPassword);

// Check Forgot Password OTP
router.post('/matchCodeForReset', userController.matchCodeForReset);

// Reset Password
router.post('/resetpassword', userController.resetPassword);

// Change Password
router.post('/changepassword', auth, userController.changePassword);

// For Pancard Verify submit the pancard information
router.post('/panrequest', auth, upload.single('image'), userController.panRequest);

// See Uploaded Pan information of user
router.get('/getpandetails', auth, userController.panDetails);

// For bank Verify submit the bank information
router.post('/bankrequest', auth, upload.single('image'), userController.bankRequest);

//See Uploaded Bank information of user
router.get('/getbankdetails', auth, userController.bankDetails);

//User Balance
router.get('/getbalance', auth, userController.getBalance);

//User Wallet and verify Details
router.get('/mywalletdetails', auth, userController.myWalletDetails);

//Withdraw Request By user
router.post('/requestwithdraw', auth, userController.requestWithdraw);

//Withdraw List of users
router.get('/mywithdrawlist', auth, userController.myWithdrawList);

//Request for Add cash
router.post('/requestaddcash', auth, userController.requestAddCash);

//Webhook data get
router.post('/webhookDetail', userController.webhookDetail);

//Social Authtication
router.post('/socialauthentication', userController.socialAuthentication);

//Payment Status change
// router.post('/paymentstatus', userController.paymentStatus);

//Get Notifications by today and privous array
router.get('/getnotification', auth, userController.getNotification);

//Get Offers
router.get('/getoffers', auth, userController.getOffers);


/**
 *  @author Devanshu Gautam
 *  @description End the user controller route
 */

/**
 *  @author Devanshu Gautam
 *  @description Starts the Match controller route
 */

// Get All Activated Seriesget
router.get('/getallseries', auth, MatchController.getAllSeries);

// Get All Upcoming Mathes
router.get('/getmatchlist', auth, MatchController.getMatchList);

router.put('/update', MatchController.update)

// Get Details of a perticular match
router.get('/getmatchdetails/:matchId', auth, MatchController.getMatchDetails);

// Get All Match Players with their points
router.get('/getallplayers/:matchId', auth, MatchController.getallplayers);

// Get Perticular Players Info
router.get('/getPlayerInfo/:matchplayerId', auth, MatchController.getPlayerInfo);

// Create Team for User to a perticular match
router.post('/createmyteam', auth, MatchController.createMyTeam);

// User All Teams of the match
router.get('/getMyTeams', auth, MatchController.getMyTeams);

// User team according their TeamId
router.get('/viewteam', auth, MatchController.viewTeam);

// User Joiend latest 5 Upcoming and live match
router.get('/newjoinedmatches', auth, MatchController.Newjoinedmatches);

// User Joiend all completed matches
router.get('/all-completed-matches', auth, MatchController.AllCompletedMatches);

// Live Match Runs
router.get('/getlivescores', auth, MatchController.getLiveScores);

// Live Leaderbord of the challange
router.get('/liveRanksLeaderboard', auth, MatchController.liveRanksLeaderboard);

// Scors/Points of players
router.get('/fantasyscorecards', auth, MatchController.fantasyScoreCards);

// Get Match Live Score
router.get('/matchlivescore', auth, MatchController.matchlivedata);

/**
 *  @author Devanshu Gautam
 *  @description End the match controller route
 */


/**
 *  @author Devanshu Gautam
 *  @description contest controller route
 */

// Gat All Contest of Match
router.get('/getAllContests', auth, ContestController.getAllContests);

// Gat Details Of A Perticular Contest of Match
router.get('/getContest', auth, ContestController.getContest);

// For User Contest/Leauge Join
router.post('/joinContest', auth, ContestController.joinContest);

// User Joined Contests/Leauge
router.get('/myjoinedcontests', auth, ContestController.myJoinedContests);

// Get Contest LeaderBard
router.get('/myleaderboard', auth, ContestController.myLeaderboard);

//Is Running contest for join Querys
router.get('/updateJoinedusers', auth, ContestController.updateJoinedusers);

//Replace With Another Team In Ongoing JoinedContest
router.post('/switchteams', auth, ContestController.switchTeams);

// Get amount to be used for joining contest
router.get('/getUsableBalance', auth, ContestController.getUsableBalance);

// Get All Contests Of A Match Without Category
router.get('/getAllContestsWithoutCategory', auth, ContestController.getAllContestsWithoutCategory);

// create private Contest
router.post('/create-private-contest', auth, ContestController.createPrivateContest);

// Contest Join By contestCode
router.post('/joinContestByCode', auth, ContestController.joinContestByCode);

router.get('/test', CronJob.updatePlayerSelected);


module.exports = router;