const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        seen: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const chatSchema = new mongoose.Schema({
    participants: [
        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    messages: [messageSchema],
});

// Keep only the latest 100 messages
chatSchema.pre("save", function () {
    if (this.messages.length > 100) {
        this.messages = this.messages.slice(-100);
    }
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = { Chat };