const constant = require('../config/const_credential');
const mongoose = require("mongoose");

exports.connectDB = async () => {
    try {
        const conn = await mongoose.connect(`${constant.DB_URL}${constant.DB_NAME}`);
        console.log(`Database connected successfully on ${conn.connection.host}`)
    } catch (error) {
        console.log("Database not connected", error);
    }
}