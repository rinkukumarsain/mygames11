const constant = require('../config/const_credential');
const mongoose = require("mongoose");
// console.log(`constant.DB_URL`, constant.DB_URL);
mongoose.connect(`${constant.DB_URL}`, {
    dbName: `${constant.DB_NAME}`,
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("mongoDB connection successfully")
}).catch(() => {
    console.log("DB no connection")
});