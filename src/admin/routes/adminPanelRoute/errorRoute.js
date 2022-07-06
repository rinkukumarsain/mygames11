const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/adminauth");
const errorController = require("../../controller/errorController");

router.get("*", auth, errorController.errorPage);

module.exports = router;
