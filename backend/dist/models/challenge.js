"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
//Schema
const challengeSchema = new mongoose_1.Schema({
    challenge: { type: String, required: true },
    //1 - easy, 2 - medium, 3 - hard, 4 - extreme
    difficulty: { type: Number },
    sexes: [{
            type: String,
            enum: ['M', 'F', 'All'],
            default: ['All']
        }]
});
exports.default = (0, mongoose_1.model)('Challenge', challengeSchema);
/* **Challenge Example** (as a JSON)
 *
 * {
 *   "challenge": "{Player} do Something.",
 *    "difficulty": 1,
 *    "sexes": ["All"]
 * }
 *
*/
