import mongoosem {Document, Schema} from 'mongoose';
import {Difficulty} from '../difficulty';
import { Sex } from '../sex';

//Types

//Interface
export interface IChallenge extends Document {
    challenge: string;
    difficulty: Difficulty;
    sexes: Array<Sex | 'All'>;
}


//Schema
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

export default mongoose.model<IChallenge>('Challenge', challengeSchema);

/* **Challenge Example** (as a JSON)
 *
 * {
 *   "challenge": "{Player} do Something.",
 *    "difficulty": 1,
 *    "sexes": ["All"]
 * }
 *
*/
