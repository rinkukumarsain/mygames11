const express = require("express");
const app = express();
const path = require("path");
const mongoose = require('mongoose');
let session = require('express-session');
require('dotenv').config();
require("./src/db/dbconnection");
const constant = require('./src/config/const_credential');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.set('debug', true);

// app.use(session({
//     name: 'sessionName',
//     secret: 'FDBGNGBV',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { sameSite: true, maxAge: 3600000 }
// }))
const { updatePlayerSelected } = require('./src/config/cronjob');
updatePlayerSelected.start();
app.use(express.static(path.join(__dirname, '/public')));

const flash = require("connect-flash");
app.use(flash());
app.use("/api", require("./src/api/routes/route"));

const port = constant.PORT_api;

app.listen(port, () => {
    console.log(`server started on port ${port}`);
});