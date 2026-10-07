const mongoose = require("mongoose");

const connectDB = async () => {
 await mongoose.connect("Database Cluster");
}

module.exports = connectDB;