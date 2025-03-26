import Challenge, { IChallenge } from '../models/challenge';
import { Difficulty } from "../models/difficulty";
import { Types } from 'mongoose';
/**
 * Get a challenge with specific difficulty, excluding certain IDs
 * 
 * @param difficulty Difficulty level ('easy', 'medium', 'hard', 'extreme')
 * @param excludeIds Array of challenge IDs to exclude
 * @returns A challenge matching the criteria
 */
export async function getChallenge(difficulty: string, excludeIds: string[] = []): Promise<IChallenge> {
    console.log('Getting challenge with difficulty:', difficulty);

    //difficulty map
    const difficultyMap: Record<string, number> = {
        'easy': Difficulty.EASY,
        'medium': Difficulty.MEDIUM,
        'hard': Difficulty.HARD,
        'extreme': Difficulty.EXTREME
    };

    let query: any = {};

    // Only apply difficulty filter if we have a valid difficulty value
    if (difficulty && difficultyMap[difficulty]) {
        query.difficulty = difficultyMap[difficulty];
    }

    // Exclude previously used challenge IDs
    if (excludeIds && excludeIds.length > 0) {
        // Convert string IDs to ObjectIds, filtering out any invalid ones
        const objectIds = excludeIds
            .map(id => {
                try {
                    return new Types.ObjectId(id);
                } catch (e) {
                    console.warn(`Invalid ObjectId in excludeIds: ${id}`);
                    return null;
                }
            })
            .filter(id => id !== null);

        if (objectIds.length > 0) {
            query._id = { $nin: objectIds };
        }
    }

    try {
        // Try to get a challenge matching our criteria
        const challenges = await Challenge.aggregate([
            { $match: query },
            { $sample: { size: 1 } }
        ]);

        if (challenges.length > 0) {
            return challenges[0];
        }

    } catch (error) {
        console.error('Error getting challenge:', error);
    }

    // Fallback challenge if all else fails
    return {
        challenge: 'Failed to get challenge... EVERYONE DRINK!',
        difficulty: Difficulty.EASY,
        sexes: ['All'],
        type: 'challenge'
    };
}

/**
 * Get challenge statistics - counts by difficulty level
 * 
 * @returns Object with counts of challenges by difficulty
 */
export async function getChallengeStats(): Promise<any> {
    console.log('Getting challenge stats');

    try {
        const easyChallenges = await Challenge.countDocuments({ difficulty: Difficulty.EASY });
        const mediumChallenges = await Challenge.countDocuments({ difficulty: Difficulty.MEDIUM });
        const hardChallenges = await Challenge.countDocuments({ difficulty: Difficulty.HARD });
        const extremeChallenges = await Challenge.countDocuments({ difficulty: Difficulty.EXTREME });
        const totalChallenges = await Challenge.countDocuments();

        return {
            easyChallenges,
            mediumChallenges,
            hardChallenges,
            extremeChallenges,
            totalChallenges
        };
        
    } catch (error) {
        console.error('Error fetching challenge stats:', error);
        return {
            easyChallenges: 1,
            mediumChallenges: 1,
            hardChallenges: 1,
            extremeChallenges: 1,
            totalChallenges: 4
        };
    }
}
