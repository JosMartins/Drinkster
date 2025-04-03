import Challenge, { IChallenge } from '../models/challenge';
import { Difficulty } from "../models/difficulty";
import { Types } from 'mongoose';

let recentChallengeIds: string[] = [];

/**
 * Get a challenge with specific difficulty, excluding certain IDs
 * 
 * @param difficulty Difficulty level ('easy', 'medium', 'hard', 'extreme')
 * @param recent Number of recent challenges to exclude
 * @returns A challenge matching the criteria
 */
export async function getChallenge(difficulty: string, recent: number): Promise<IChallenge> {
    console.log('Getting challenge with difficulty:', difficulty);

    // Difficulty map remains the same
    const difficultyMap: Record<string, number> = {
        'easy': Difficulty.EASY,
        'medium': Difficulty.MEDIUM,
        'hard': Difficulty.HARD,
        'extreme': Difficulty.EXTREME
    };

    const query = {
        difficulty: difficultyMap[difficulty],
        ...(recentChallengeIds.length > 0 && { _id: { $nin: recentChallengeIds } })
    };

    try {
        // Get challenge WITH _id first
        const challenges = await Challenge.aggregate([
            { $match: query },
            { $sample: { size: 1 } }
        ]);

        if (challenges.length > 0) {
            // Store ID before removing it from response
            const challengeId = challenges[0]._id.toString();
            recentChallengeIds.push(challengeId);
            if (recentChallengeIds.length > recent) recentChallengeIds.shift();

            // Return challenge WITHOUT _id
            return {
                challenge: challenges[0].challenge,
                difficulty: challenges[0].difficulty,
                sexes: challenges[0].sexes,
                sips: challenges[0].sips,
                type: challenges[0].type,
                penalty_params: challenges[0].penalty_params
            };
        }

        return fallbackChallenge();

    } catch (error) {
        console.error('Error getting challenge:', error);
        return fallbackChallenge();
    }
}

// Add fallback function
function fallbackChallenge(): IChallenge {
    return {
        challenge: 'Failed... Everyone drink 2 sips!',
        difficulty: Difficulty.EASY,
        sexes: ['All'],
        sips: 2,
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
