const Challenge = require('../models/challenge');
const asyncHandler = require('express-async-handler');
const { json } = require('express');

//Gets a random challenge
exports.get_challenge = asyncHandler(async (req, res, next) => {
    console.log("Challenge Requested.");

    const challenges = await Challenge.aggregate([{ $sample: { size: 1 }}]);

    if (challenges.length > 0) {
        res.send(challenges[0]);
    } else {
        res.status(404).json({error: 'No Challenge Found.'});
    }

})

//Creates a challenge
exports.add_challenge = asyncHandler(async (req, res, next) => {
    console.log("Saved a challenge");

    const { challenge, difficulty } = req.body;
    console.log(challenge);
    console.log(difficulty);

    if (challenge === null) {
        return res.status(400).json({ error: 'No text in challenge string' });
    }

    try {
        const challengeObj = new Challenge({ challenge, difficulty });
        const existing = await Challenge.findOne({ challenge: challenge });
        if (existing) {
            return res.status(400).json({ error: 'Challenge already exists' });
        }
        await challengeObj.save();
        res.status(201).json(challengeObj);
    } catch (error) {
        next(error);
    }
});

//Add all challenges from a list
exports.add_all_challenges = asyncHandler(async (req, res, next) => {
    console.log("Saved all challenges");

    const challenges = req.body;
    console.log(challenges);

    if (challenges === null) {
        return res.status(400).json({ error: 'No challenges' });
    }

    try {
        for (const element of challenges) {
            const challengeObj = new Challenge(element);
            if (challengeObj.challenge === null) {
                return res.status(400).json({error: 'No text in challenge string'});
            }

            const existing = await Challenge.findOne({challenge: element.challenge });
            if (existing) {
                return res.status(400).json({ error: 'Challenge already exists' });
            }
            await challengeObj.save();
        }
        res.status(201).json({ message: 'All challenges added successfully' });
    } catch (error) {
        next(error);
    }

});

//Gets an easy challenge
exports.get_easy_challenge = asyncHandler( async (req, res, next) => {
    console.log('Easy Challenge Requested.');

    const easyChallenges = await Challenge.aggregate([{$match: {difficulty: 1}},{$sample: {size: 1}}])

    if (easyChallenges.length > 0) {
        res.send(easyChallenges[0]);
    } else {
        res.status(404).json({error: 'No Challenge Found.'});
    }
});

//Gets a medium challenge
exports.get_medium_challenge = asyncHandler( async (req, res, next) => {
    console.log('Medium Challenge Requested.');

    const mediumChallenges = await Challenge.aggregate([{$match: {difficulty: 2}},{$sample: {size: 1}}])

    if (mediumChallenges.length > 0) {
        res.send(mediumChallenges[0]);
    } else {
        res.status(404).json({error: 'No Challenge Found.'});
    }
});

//Gets a hard challenge
exports.get_hard_challenge = asyncHandler( async (req, res, next) => {
    console.log('Hard Challenge Requested.');

    const hardChallenges = await Challenge.aggregate([{$match: {difficulty: 3}},{$sample: {size: 1}}])

    if (hardChallenges.length > 0) {
        res.send(hardChallenges[0]);
    } else {
        res.status(404).json({error: 'No Challenge Found.'});
    }
});

//Gets an extreme challenge
exports.get_extreme_challenge = asyncHandler( async (req, res, next) => {
    console.log('Extreme Challenge Requested.');

    const extremeChallenges = await Challenge.aggregate([{$match: {difficulty: 4}},{$sample: {size: 1}}])

    if (extremeChallenges.length > 0) {
        res.send(extremeChallenges[0]);
    } else {
        res.status(404).json({error: 'No Challenge Found.'});
    }
});

exports.get_all_challenges = asyncHandler( async(req, res, next) => {
    console.log('Got All Challenges');

    const allChallenges = await Challenge.find();

    res.send(allChallenges);
})

//delete a challenge
exports.delete_challenge = asyncHandler(async (req, res, next) => {
    console.log('Deleted a challenge');
    const challengeId = req.params.id;

    console.log(challengeId);
    try {
        const deletedChallenge = await Challenge.findByIdAndDelete(challengeId);
        if (!deletedChallenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }
        res.status(200).json({ message: 'Challenge deleted successfully' });
    } catch (error) {
        next(error);
    }
});