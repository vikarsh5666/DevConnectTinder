const mongoose = require("mongoose");

const connectDB = async () => {
 await mongoose.connect("mongodb+srv://vikarsh1994verma_db_user:UBgOUmgQ36gq5SsF@vikarshdev.xhibkwg.mongodb.net/DevConnectionTinder");
}

module.exports = connectDB;