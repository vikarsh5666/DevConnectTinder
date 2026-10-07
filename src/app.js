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

app.get('/user', async (req, res) => {
    const userEmail = req.body.emailId;
    try {
        const user = await User.findOne({ emailId: userEmail });
        if(user.length ===0) res.status(404).send("user not found");
        else {
            res.send(user);
        }
    }
    catch (err) {
        res.status(400).send("something went wrong");
    }
})

app.get('/feed', async (req, res) => {
    try {
        const user = await User.find({});
        res.send(user);
    }
    catch (err) {
        res.status(400).send("something went wrong");
    }
})

app.delete('/user', async (req, res) => {
    const userId = req.body.userId;
    try {
        const user = await User.findByIdAndDelete(userId);
        if(!user) {
            res.status(404).send("user not found");
        }else{
            res.send("user deleted!!");
        }
    }
    catch (err) {
        res.status(400).send("something went wrong");
    }
})

connectDB().then(() => {
    console.log("Database connection established");
    app.listen(3000, () => {
        console.log("Server succesfully run on Port 3000");
    });
})
    .catch((err) => {
        console.error("Database can not be connected");
    })