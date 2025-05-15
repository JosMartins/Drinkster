const mongoose = require("mongoose");
const express = require("express");
const cors = require('cors');
const path = require('path');


const initRouter = require('./routes/init')
const challengeRouter = require('./routes/challenge')

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const mongoDB = process.env.MONGO_URI;


main().catch((err) => console.log(err));
async function main() {
    await mongoose.connect(mongoDB);
    console.log("Connected to DB!");
}

app.use('/', initRouter);
app.use('/api/challenge', challengeRouter);

app.use(function (err, req, res, next) {
    console.error(err.stack);

    let errorMessage = 'An unexpected error occurred';
    if (err.message) {
        errorMessage = err.message;
    }

    if (err.status === 502) {
        errorMessage = 'Backend service is unavailable';
    }

    res.status(err.status || 500);
    res.json({ error: errorMessage });
});

app.listen(3432, () => {
    console.log("Server is up and running on port 3432");
});
module.exports = app;