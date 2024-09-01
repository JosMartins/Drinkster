const mongoose = require("mongoose");
const express = require("express");
const createError = require('http-errors');
const cors = require('cors');
const path = require('path');


const initRouter = require('./routes/init')
const challengeRouter = require('./routes/challenge')

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const db ="mongodb://127.0.0.1:27017/test";

const mongoDB = "mongodb://127.0.0.1:27017/test";



main().catch((err) => console.log(err));
async function main() {
    await mongoose.connect(mongoDB);
    console.log("Connected to DB!");
}

app.use('/', initRouter);
app.use('/challenge', challengeRouter);

app.use(function (err, req, res, next) {
    console.error(err.stack); // Log the error stack trace for debugging

    // Customize the error message based on the error type
    let errorMessage = 'An unexpected error occurred';
    if (err.message) {
        errorMessage = err.message;
    }

    res.status(err.status || 500);
    res.json({ error: errorMessage });
});

app.listen(3000)
module.exports = app;