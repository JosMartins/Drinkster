const mongoose = require('mongoose')

const challengeSchema = new mongoose.Schema({

    challenge: {type: String, required: true},
    //1 - easy, 2 - medium, 3 - hard, 4 - extreme
    difficulty: {type: Number}
});

module.exports = mongoose.model('Question', challengeSchema);