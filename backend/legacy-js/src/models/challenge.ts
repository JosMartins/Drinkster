import {ObjectId, Schema, model, Types} from 'mongoose';
import { Difficulty } from './difficulty';
import { Sex } from '../types/sex';

//Types

//Interface

interface IPenaltyParams {
    rounds?: number;
    text?: string
}

export interface IChallenge {
    challenge: string;
    difficulty: Difficulty;
    sexes: Array<Sex | 'All'>;
    players?: number; //only for challenges
    sips?: number; //only for challenges
    type: 'challenge' | 'penalty';
    penalty_params?: IPenaltyParams;
}


//Schema
const penaltyParamsSchema = new Schema<IPenaltyParams>({
    rounds: { 
      type: Number, 
      default: 1,
      min: [1, 'Rounds cannot be less than 1']
    },
    text: {
      type: String,
      default: 'Drink',
    }
  });
  
  const challengeSchema = new Schema<IChallenge>({
    challenge: { type: String, required: true },
    difficulty: {
      type: Number,
      enum: [1, 2, 3, 4],
      required: true
    },
    sexes: [{
      type: String,
      enum: ['M', 'F', 'All'],
      default: ['All']
    }],
    players: {type: Number},
    sips: {
      type: Number,
      default: 5,
      min: [0, 'Sips cannot be negative']
    },
    type: {
      type: String,
      enum: ['challenge', 'penalty'],
      default: 'challenge'
    },
    penalty_params: {
      type: penaltyParamsSchema
    }
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
