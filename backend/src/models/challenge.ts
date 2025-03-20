import { ObjectId, Schema, model} from 'mongoose';
import { Difficulty } from './difficulty';
import { Sex } from '../types/sex';

//Types

//Interface
export interface IChallenge {
    _id?: ObjectId;
    challenge: string;
    difficulty: Difficulty;
    sexes: Array<Sex | 'All'>;
    players?: number; //only for challenges
    sips?: number; //only for challenges
    rounds?: number; //only for penalties
    type: 'challenge' | 'penalty';
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
    }],
    players: {type: Number, default: 1},
    sips: {type: Number, default: 5},
    type: {type: String, enum:['challenge', 'penalty'],default: 'challenge'}

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
