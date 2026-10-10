const express = require("express");
const { userAuth } = require("../middleware/auth");
const {validateAllowedFields} = require("../utils/validation");
const user = require("../models/user");

const profileRouter = express.Router();

profileRouter.get('/profile/view', userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send(user);
    }
    catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

profileRouter.patch('/profile/edit', userAuth, async (req, res) => {
    try {
        const isValidateAllowedFields = validateAllowedFields(req);
        if(!isValidateAllowedFields){
            throw new Error("Un supported field edits");
        }
        const loggedInUser = req.user;
        Object.keys(req.body).forEach(key => loggedInUser[key] = req.body[key]);
        await loggedInUser.save();
        res.json({
            message: `${loggedInUser.firstName}, your profile updated succesfuly`,
            data: loggedInUser
        });
    }
    catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
})

module.exports = profileRouter;