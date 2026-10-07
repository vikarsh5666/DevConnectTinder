const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
    firstName: { type: String },
    lastName: { type: String },
    emailId: { type: String },
    age: { type: Number },
    password: { type: String },
    gender: { type: String }
})

module.exports = mongoose.model('User', userSchema);