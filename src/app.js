const express = require("express");

const app = express();

app.use('/ready', (req, res) => {
    res.send("Ready!!!");
});

app.use('/test', (req, res) => {
    res.send("Test Ready!");
});

app.listen(3000, () => {
    console.log("Server succesfully run on Port 3000");
})