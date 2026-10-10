const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
    {
        fromUserId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        toUserId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: {
                values: ['ignored', 'interested', 'accepted', 'rejected']
            },
            message: `{VALUE} is incorrect status type`,
        }
    },
    {
        timestamps: true,
    }
);

connectionRequestSchema.index({ fromUserId: 1 });

connectionRequestSchema.pre("save", function () {
    const connectionRequest = this;
    //check if from user id is same to userId
    if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
        throw new Error("Can not sent connection request to yourself!!!");
    }
});

const connectionRequestModel = new mongoose.model(
    "ConnectionRequest",
    connectionRequestSchema,
)
module.exports = connectionRequestModel;
