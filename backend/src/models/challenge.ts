import { Schema, model} from 'mongoose';
import { Difficulty } from './difficulty';
import { Sex } from '../types/sex';

//Types

//Interface
export interface IChallenge extends Document {
    challenge: string;
    difficulty: Difficulty;
    sexes: Array<Sex | 'All'>;
}


//Schema
const challengeSchema = new Schema({

    challenge: {type: String, required: true},
    //1 - easy, 2 - medium, 3 - hard, 4 - extreme
    difficulty: {type: Number},
    sexes: [{
        type: String,
        enum: ['M', 'F', 'All'],
        default: ['All']
    }]
});

export default model<IChallenge>('Challenge', challengeSchema);


/* **Challenge Example** (as a JSON)
 *
 * {
 *   "challenge": "{Player} do Something.",
 *    "difficulty": 1,
 *    "sexes": ["All"]
 * }
 *
*/
