const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);

// app.get('/user', async (req, res) => {
//     const userEmail = req.body.emailId;
//     try {
//         const user = await User.findOne({ emailId: userEmail });
//         if (user.length === 0) res.status(404).send("user not found");
//         else {
//             res.send(user);
//         }
//     }
//     catch (err) {
//         res.status(400).send("something went wrong");
//     }
// })

// app.get('/feed', async (req, res) => {
//     try {
//         const user = await User.find({});
//         res.send(user);
//     }
//     catch (err) {
//         res.status(400).send("something went wrong");
//     }
// })

// app.delete('/user', async (req, res) => {
//     const userId = req.body.userId;
//     try {
//         const user = await User.findByIdAndDelete(userId);
//         if (!user) {
//             res.status(404).send("user not found");
//         } else {
//             res.send("user deleted!!");
//         }
//     }
//     catch (err) {
//         res.status(400).send("something went wrong");
//     }
// })

connectDB().then(() => {
    console.log("Database connection established");
    app.listen(3000, () => {
        console.log("Server succesfully run on Port 3000");
    });
})
    .catch((err) => {
        console.error("Database can not be connected: ", err.message);
    })