import {Request, Response, NextFunction} from 'express';
import asyncHandler from 'express-async-handler';
import Challenge, { IChallenge } from '../models/challenge';
import { Difficulty } from '../models/difficulty';


//Gets a random challenge
export const get_challenge = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    console.log("Challenge Requested.");

    const challenges = await Challenge.aggregate([{ $sample: { size: 1 } }]);

    if (challenges.length > 0) {
        res.send(challenges[0]);
    } else {
        res.status(404).json({ error: 'No Challenge Found.' });
    }

})

//Creates a challenge
export const add_challenge = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    console.log("Saved a challenge");

    const { challenge, difficulty, sexes } = req.body;
    console.log(challenge);
    console.log(difficulty);

    if (challenge === null) {
        res.status(400).json({ error: 'No text in challenge string' });
        return;
    }

    try {
        const challengeObj = new Challenge({ challenge, difficulty, sexes });
        const existing = await Challenge.findOne({ challenge: challenge });
        if (existing) {
            res.status(400).json({ error: 'Challenge already exists' });
            return;
        }
        await challengeObj.save();
        res.status(201).json(challengeObj);
    } catch (error) {
        next(error);
    }
});

//Add all challenges from a list
export const add_all_challenges = asyncHandler(async (req: Request, res: Response, next: NextFunction) => { 
    console.log("Saved all challenges");

    const challenges = req.body;
    console.log(challenges);

    if (challenges === null) {
        res.status(400).json({ error: 'No challenges' });
        return;
    }

    try {
        for (const element of challenges) {
            const challengeObj = new Challenge(element);
            if (challengeObj.challenge === null) {
                res.status(400).json({ error: 'No text in challenge string' });
                return;
            }

            const existing = await Challenge.findOne({ challenge: element.challenge });
            if (existing) {
                res.status(400).json({ error: 'Challenge already exists' });
                return;
            }
            await challengeObj.save();
        }
        res.status(201).json({ message: 'All challenges added successfully' });
    } catch (error) {
        next(error);
    }

});

//Gets an easy challenge
export const get_easy_challenge = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    console.log('Easy Challenge Requested.');

    const easyChallenges = await Challenge.aggregate([{ $match: { difficulty: 1 } }, { $sample: { size: 1 } }])

    if (easyChallenges.length > 0) {
        res.send(easyChallenges[0]);
    } else {
        res.status(404).json({ error: 'No Challenge Found.' });
    }
});

//Gets a medium challenge
export const get_medium_challenge = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    console.log('Medium Challenge Requested.');

    const mediumChallenges = await Challenge.aggregate([{ $match: { difficulty: 2 } }, { $sample: { size: 1 } }])

    if (mediumChallenges.length > 0) {
        res.send(mediumChallenges[0]);
    } else {
        res.status(404).json({ error: 'No Challenge Found.' });
    }
});

//Gets a hard challenge
export const get_hard_challenge = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    console.log('Hard Challenge Requested.');

    const hardChallenges = await Challenge.aggregate([{ $match: { difficulty: 3 } }, { $sample: { size: 1 } }])

    if (hardChallenges.length > 0) {
        res.send(hardChallenges[0]);
    } else {
        res.status(404).json({ error: 'No Challenge Found.' });
    }
});

//Gets an extreme challenge
export const get_extreme_challenge = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    console.log('Extreme Challenge Requested.');

    const extremeChallenges = await Challenge.aggregate([{ $match: { difficulty: 4 } }, { $sample: { size: 1 } }])

    if (extremeChallenges.length > 0) {
        res.send(extremeChallenges[0]);
    } else {
        res.status(404).json({ error: 'No Challenge Found.' });
    }
});

export const get_all_challenges = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    console.log('Got All Challenges');
    let challenges: Array<IChallenge> = []; 

    if (req.query.difficulty) {
        const difficulty = parseInt(req.query.difficulty as string);
        challenges = await Challenge.find({ difficulty: difficulty });

    } else {
        challenges = await Challenge.find();
    }

    res.send(challenges);
})

//delete a challenge
export const delete_challenge = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const challengeId = req.params.id;
    const password = req.query.pass;

    if (password !== "fax123") { //i know this is bad but i dont care
        console.log("Wrong Password");
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    console.log(challengeId);
    try {
        const deletedChallenge = await Challenge.findByIdAndDelete(challengeId);
        if (!deletedChallenge) {
            res.status(404).json({ error: 'Challenge not found' });
            return;
        }
        console.log('Deleted a challenge');
        res.status(200).json({ message: 'Challenge deleted successfully' });
    } catch (error) {
        next(error);
    }
});


export const challenge_stats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    
    let easyChallenges = await Challenge.countDocuments({ difficulty: Difficulty.EASY });
    let mediumChallenges = await Challenge.countDocuments({ difficulty: Difficulty.MEDIUM });
    let hardChallenges = await Challenge.countDocuments({ difficulty: Difficulty.HARD });
    let extremeChallenges = await Challenge.countDocuments({ difficulty: Difficulty.EXTREME });
    let totalChallenges = await Challenge.countDocuments();
    
    let response = {
        easyChallenges : easyChallenges,
        mediumChallenges : mediumChallenges,
        hardChallenges : hardChallenges,
        extremeChallenges : extremeChallenges,
        totalChallenges : totalChallenges
    };

    console.log('Got Challenge Stats');
    res.status(200).json(response);

})