const mongoose = require('mongoose')

const playerSchema = new mongoose.Schema({

    name: {type: String, required: true},
    sex: {type: Number}
});

module.exports = mongoose.model('Player', playerSchema);