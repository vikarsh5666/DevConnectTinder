const express = require("express");
const User = require("../models/user");
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const validator = require('validator');
const { validateSignUpData } = require('../utils/validation');

const authRouter = express.Router();

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);

authRouter.post('/signup', async (req, res) => {
    const { firstName, lastName, emailId, password, gender } = req.body;
    try {
        validateSignUpData(req);
        //Encrypt password
        const passwordHash = await bcrypt.hash(password, 10);

        const userObj = new User({
            firstName, lastName, emailId, password: passwordHash, gender
        });
        const savedUser = await userObj.save();

        const jwtToken = await savedUser.getJWT();

        res.cookie("token", jwtToken, { expires: new Date(Date.now() + 8 * 3600000) });
        res.json({ message: "user created sucessfully!!", data: savedUser });
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

            res.cookie("token", jwtToken,
                {
                    expires: new Date(Date.now() + 8 * 3600000),
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",

                });
            res.send(user);
        }
        else {
            return res.status(400).json({
                message: 'Password Is not correct!!',
            })
        }
    }
    catch (err) {
        res.status(400).send('ERROR: ' + err.message);
    }

    bcrypt
});

authRouter.post('/logout', async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
    });
    res.send("Logout Successful!!");
});

authRouter.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                message: 'Google credential is required'
            });
        }

        // Verify the Google ID token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email || !payload.email_verified) {
            return res.status(401).json({
                message: 'Google account email is not verified'
            });
        }

        const {
            sub: googleId,
            email,
            given_name,
            family_name,
            picture
        } = payload;
        let isNewUser = false;
        let user = await User.findOne({
            emailId: email.toLowerCase()
        });

        if (user) {
            // Link the verified Google account to the existing user
            if (user.googleId && user.googleId !== googleId) {
                return res.status(409).json({
                    message: 'This email is linked to another Google account'
                });
            }

            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }

            // Update Google profile photo
            if (picture) {
                user.photoUrl = user.photoUrl || picture;
            }

        } else {
            isNewUser = true;
            user = await User.create({
                firstName: given_name || 'Google User',
                lastName: family_name || undefined,
                emailId: email.toLowerCase(),
                googleId,
                photoUrl: picture
            });
        }

        const jwtToken = await user.getJWT();

        res.cookie('token', jwtToken, {
            expires: new Date(Date.now() + 8 * 3600000),
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });

        return res.json({
            message: 'Google login successful',
            data: user,
            isNewUser
        });

    } catch (err) {
        console.error('Google login error:', err.message);

        return res.status(401).json({
            message: 'Google login failed'
        });
    }
});

module.exports = authRouter;