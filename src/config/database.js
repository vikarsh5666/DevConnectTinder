const mongoose = require("mongoose");

const connectDB = async () => {
 await mongoose.connect("mongodb+srv://vikarsh1994verma_db_user:vNMGKDYaTynnAzb0@vikarshdev.xhibkwg.mongodb.net/DevConnectionTinder");
}

module.exports = connectDB;