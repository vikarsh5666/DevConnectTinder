const express = require("express");
const { userAuth } = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const requestRouter= express.Router();

requestRouter.post('/request/send/:status/:toUserId', userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        const allowedStatus = ['ignored', 'interested'];
        if(!allowedStatus.includes(status)){
            return res
            .status(400)
            .json({
                message: "Invalid status type: " +  status
            });
        };

        //IF There is an existing connection Request
        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                {fromUserId, toUserId},
                {fromUserId: toUserId, toUserId: fromUserId}
            ]
        });
        if(existingConnectionRequest){
            return res.status(400).json({
                message: 'Connection request already exist!!',
            })
        };

        //To User is not exist and try to send request
        const toUser = await User.findById(toUserId);
        if(!toUser){
            return res.status(400).json({
                message: 'User not found!!',
            })   
        };

        const connection = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });
        const data = await connection.save();

        res.json({
            message: `${req.user.firstName} is ${status}, ${toUser.firstName}`,
            data: data,
        })
        
    }
    catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
})

module.exports = requestRouter;