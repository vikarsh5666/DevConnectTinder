const express = require("express");
const User = require("../models/user");
const bcrypt = require('bcrypt');
const validator = require('validator');
const { validateSignUpData } = require('../utils/validation');

const authRouter = express.Router();

authRouter.post('/signup', async (req, res) => {
    const { firstName, lastName, emailId, password, gender } = req.body;
    try {
        validateSignUpData(req);
        //Encrypt password
        const passwordHash = await bcrypt.hash(password, 10);

        const userObj = new User({
            firstName, lastName, emailId, password: passwordHash, gender
        });
        await userObj.save();
        res.send("user created sucessfully!!");
    }
    catch (err) {
        res.status(400).send("Some technical issue while saving user, please connect contact support: " + err.message);
    }
});

authRouter.post('/login', async (req, res) => {
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

authRouter.post('/logout', async (req, res) => {
    res
    .cookie("token", null, {expires: new Date(new Date())})
    .send("Logout Successfuly!!");
});

module.exports = authRouter;