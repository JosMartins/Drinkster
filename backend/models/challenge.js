const mongoose = require('mongoose')

const challengeSchema = new mongoose.Schema({

    challenge: {type: String, required: true},
    //1 - easy, 2 - medium, 3 - hard, 4 - extreme
    difficulty: {type: Number},
    sexes: [{
        type: String,
        enum: ['M', 'F', 'All'],
        default: ['All']
    }]
});

module.exports = mongoose.model('Question', challengeSchema);

/* **Challenge Example** (as a JSON)
 *
 * {
 *   "challenge": "{Player} do Something.",
 *    "difficulty": 1,
 *    "sexes": ["All"]
 * }
 *
*/
