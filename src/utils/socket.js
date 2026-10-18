const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const getSecretRoomId = (userId, targetUserId) => {
    return crypto
        .createHash("sha256")
        .update([userId, targetUserId].sort().join("$"))
        .digest("hex");
};

const initializeSocket = (server) => {
    const io = socket(server, {
        cors: {
            origin: "http://localhost:5173",
        },
    });

    io.on("connection", (socket) => {
        socket.on("joinChat", async ({ firstName, userId, targetUserId }) => {
            const roomId = getSecretRoomId(userId, targetUserId);
            console.log(firstName + " joined Room : " + roomId);
            socket.join(roomId);

            socket.data.userId = userId;

            await User.findByIdAndUpdate(userId, {
                isOnline: true,
                lastSeen: null,
            });
        });

        socket.on(
            "sendMessage",
            async ({ firstName, lastName, userId, targetUserId, text }) => {
                // Save messages to the database
                try {
                    const roomId = getSecretRoomId(userId, targetUserId);
                    console.log(firstName + " " + text);

                    // TODO: Check if userId & targetUserId are friends

                    let chat = await Chat.findOne({
                        participants: { $all: [userId, targetUserId] },
                    });

                    if (!chat) {
                        chat = new Chat({
                            participants: [userId, targetUserId],
                            messages: [],
                        });
                    }

                    chat.messages.push({
                        senderId: userId,
                        text,
                        seen: false,
                    });

                    await chat.save();

                    const savedMessage = chat.messages[chat.messages.length - 1];

                    io.to(roomId).emit("messageReceived", {
                        _id: savedMessage._id.toString(),
                        senderId: userId.toString(),
                        firstName,
                        lastName,
                        text,
                        seen: false,
                    });
                } catch (err) {
                    console.log(err);
                }
            }
        );

        socket.on("markMessagesSeen", async ({ userId, targetUserId }) => {
            try {
                const roomId = getSecretRoomId(userId, targetUserId);
        
                const chat = await Chat.findOne({
                    participants: { $all: [userId, targetUserId] },
                });
        
                if (!chat) return;
        
                const unseenMessages = chat.messages.filter(
                    (message) =>
                        message.senderId.toString() === targetUserId &&
                        !message.seen
                );
        
                if (unseenMessages.length === 0) return;
        
                unseenMessages.forEach((message) => {
                    message.seen = true;
                });
        
                await chat.save();
        
                const messageIds = unseenMessages.map((message) =>
                    message._id.toString()
                );
        
                io.to(roomId).emit("messagesSeen", {
                    messageIds,
                    seenBy: userId,
                });
            } catch (err) {
                console.error("Error marking messages as seen:", err);
            }
        });

        socket.on("disconnect", async () => {
            const userId = socket.data.userId;

            if (!userId) return;

            await User.findByIdAndUpdate(userId, {
                isOnline: false,
                lastSeen: new Date(),
            });
        });
    });
};

module.exports = initializeSocket;