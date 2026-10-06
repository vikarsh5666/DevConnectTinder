const express = require("express");

const app = express();

// handle only get call for /user
app.get('/user', (req, res) => {
    res.send({fisrtname: 'vikarsh', lastname: 'verma'});
})

app.post('/user', (req, res) => {
    res.send("Data send succesfully");
})

app.delete('/user', (req, res) => {
    res.send("Deleted sucessfully");
});

// this will match all the http method API call to /test
app.use('/test', (req, res) => {
    res.send("Test Ready!");
});

app.listen(3000, () => {
    console.log("Server succesfully run on Port 3000");
})