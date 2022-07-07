const express = require("express");
let session = require('express-session');
const cookieParser = require('cookie-parser');
const moment = require('moment');
const path = require("path");
const mongoose = require('mongoose');
const constant = require('./src/config/const_credential');
const app = express();

app.use(cookieParser());
app.use(session({
    secret: constant.SECRET_TOKEN,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 6*60*60*1000, httpOnly: true }
}));

require('dotenv').config();
require("./src/db/dbconnection");
const constant = require('./src/config/const_credential');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.set('debug', true);
app.use(express.static(path.join(__dirname, '/public')));

const flash = require("connect-flash");
app.use(flash());

app.set('views', path.join(__dirname, 'src/admin/views'));
app.set("view engine", "ejs");

const adminRouter = require("./src/admin/routes/adminPanelRoute/route");
app.use("/", adminRouter);

const errorRoute = require("./src/admin/routes/adminPanelRoute/errorRoute");
app.use(errorRoute);

const port = constant.PORT;

app.listen(port, () => {
    console.log(`server started on port ${port}`);
});