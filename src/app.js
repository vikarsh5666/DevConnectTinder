const express = require("express");
const connectDB = require("./config/database");
const bcrypt = require('bcrypt');
const User = require("./models/user");
const validator = require('validator');
const { validateSignUpData } = require('./utils/validation');
const { userAuth } = require("./middleware/auth");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.post('/signup', async (req, res) => {
    const { firstName, lastName, emailId, password } = req.body;
    try {
        validateSignUpData(req);
        //Encrypt password
        const passwordHash = await bcrypt.hash(password, 10);

        const userObj = new User({
            firstName, lastName, emailId, password: passwordHash
        });
        await userObj.save();
        res.send("user created sucessfully!!");
    }
    catch (err) {
        res.status(400).send("Some technical issue while saving user, please connect contact support: " + err.message);
    }
});

app.post('/login', async (req, res) => {
    try {
        const { emailId, password } = req.body;
        if (!validator.isEmail(emailId)) {
            throw new Error('Email Id is not valid: ' + emailId);
        };
        const user = await User.findOne({ emailId: emailId });
        if (!user) {
            throw new Error('Invalid Credentials');
        };
        const isPassWordValid = await user.validatePassword(password);

        if (isPassWordValid) {
            const jwtToken = await user.getJWT();

            res.cookie("token", jwtToken, { expires: new Date(Date.now() + 8 * 3600000) });
            res.send('Login succesfull!!');
        }
        else {
            throw new Error('Password Is not correct');
        }
    }
    catch (err) {
        res.status(400).send('ERROR: ' + err.message);
    }

    bcrypt
});

app.get('/user', async (req, res) => {
    const userEmail = req.body.emailId;
    try {
        const user = await User.findOne({ emailId: userEmail });
        if (user.length === 0) res.status(404).send("user not found");
        else {
            res.send(user);
        }
    }
    catch (err) {
        res.status(400).send("something went wrong");
    }
})

app.get('/profile', userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send(user);
    }
    catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
})

app.post('/sendConnectionRequest', userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send(user.firstName + " Sent a connection Request");
    }
    catch (err) {
        res.status(400).send("ERROR: " + err.message);
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
        if (!user) {
            res.status(404).send("user not found");
        } else {
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