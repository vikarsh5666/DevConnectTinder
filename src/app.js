const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");

const app = express();

app.use(express.json());

app.post('/signup', async (req, res) => {
    const userObj = new User(req.body);
    try {
        await userObj.save();
        res.send("user created sucessfully!!");
    }
    catch (err) {
        res.status(400).send("Some technical issue while saving user, please connect contact support" + err.message);
    }

});

connectDB().then(() => {
    console.log("Database connection established");
    app.listen(3000, () => {
        console.log("Server succesfully run on Port 3000");
    });
})
    .catch((err) => {
        console.error("Database can not be connected");
    })