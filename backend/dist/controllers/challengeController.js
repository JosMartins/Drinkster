"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.challenge_stats = exports.delete_challenge = exports.get_all_challenges = exports.get_extreme_challenge = exports.get_hard_challenge = exports.get_medium_challenge = exports.get_easy_challenge = exports.add_all_challenges = exports.add_challenge = exports.get_challenge = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const challenge_1 = __importDefault(require("../models/challenge"));
const difficulty_1 = require("../models/difficulty");
//Gets a random challenge
exports.get_challenge = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Challenge Requested.");
    const challenges = yield challenge_1.default.aggregate([{ $sample: { size: 1 } }]);
    if (challenges.length > 0) {
        res.send(challenges[0]);
    }
    else {
        res.status(404).json({ error: 'No Challenge Found.' });
    }
}));
//Creates a challenge
exports.add_challenge = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Saved a challenge");
    const { challenge, difficulty, sexes } = req.body;
    console.log(challenge);
    console.log(difficulty);
    if (challenge === null) {
        res.status(400).json({ error: 'No text in challenge string' });
        return;
    }
    try {
        const challengeObj = new challenge_1.default({ challenge, difficulty, sexes });
        const existing = yield challenge_1.default.findOne({ challenge: challenge });
        if (existing) {
            res.status(400).json({ error: 'Challenge already exists' });
            return;
        }
        yield challengeObj.save();
        res.status(201).json(challengeObj);
    }
    catch (error) {
        next(error);
    }
}));
//Add all challenges from a list
exports.add_all_challenges = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Saved all challenges");
    const challenges = req.body;
    console.log(challenges);
    if (challenges === null) {
        res.status(400).json({ error: 'No challenges' });
        return;
    }
    try {
        for (const element of challenges) {
            const challengeObj = new challenge_1.default(element);
            if (challengeObj.challenge === null) {
                res.status(400).json({ error: 'No text in challenge string' });
                return;
            }
            const existing = yield challenge_1.default.findOne({ challenge: element.challenge });
            if (existing) {
                res.status(400).json({ error: 'Challenge already exists' });
                return;
            }
            yield challengeObj.save();
        }
        res.status(201).json({ message: 'All challenges added successfully' });
    }
    catch (error) {
        next(error);
    }
}));
//Gets an easy challenge
exports.get_easy_challenge = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Easy Challenge Requested.');
    const easyChallenges = yield challenge_1.default.aggregate([{ $match: { difficulty: 1 } }, { $sample: { size: 1 } }]);
    if (easyChallenges.length > 0) {
        res.send(easyChallenges[0]);
    }
    else {
        res.status(404).json({ error: 'No Challenge Found.' });
    }
}));
//Gets a medium challenge
exports.get_medium_challenge = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Medium Challenge Requested.');
    const mediumChallenges = yield challenge_1.default.aggregate([{ $match: { difficulty: 2 } }, { $sample: { size: 1 } }]);
    if (mediumChallenges.length > 0) {
        res.send(mediumChallenges[0]);
    }
    else {
        res.status(404).json({ error: 'No Challenge Found.' });
    }
}));
//Gets a hard challenge
exports.get_hard_challenge = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Hard Challenge Requested.');
    const hardChallenges = yield challenge_1.default.aggregate([{ $match: { difficulty: 3 } }, { $sample: { size: 1 } }]);
    if (hardChallenges.length > 0) {
        res.send(hardChallenges[0]);
    }
    else {
        res.status(404).json({ error: 'No Challenge Found.' });
    }
}));
//Gets an extreme challenge
exports.get_extreme_challenge = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Extreme Challenge Requested.');
    const extremeChallenges = yield challenge_1.default.aggregate([{ $match: { difficulty: 4 } }, { $sample: { size: 1 } }]);
    if (extremeChallenges.length > 0) {
        res.send(extremeChallenges[0]);
    }
    else {
        res.status(404).json({ error: 'No Challenge Found.' });
    }
}));
exports.get_all_challenges = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Got All Challenges');
    let challenges = [];
    if (req.query.difficulty) {
        const difficulty = parseInt(req.query.difficulty);
        challenges = yield challenge_1.default.find({ difficulty: difficulty });
    }
    else {
        challenges = yield challenge_1.default.find();
    }
    res.send(challenges);
}));
//delete a challenge
exports.delete_challenge = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const challengeId = req.params.id;
    const password = req.query.pass;
    if (password !== "fax123") { //i know this is bad but i dont care
        console.log("Wrong Password");
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    console.log(challengeId);
    try {
        const deletedChallenge = yield challenge_1.default.findByIdAndDelete(challengeId);
        if (!deletedChallenge) {
            res.status(404).json({ error: 'Challenge not found' });
            return;
        }
        console.log('Deleted a challenge');
        res.status(200).json({ message: 'Challenge deleted successfully' });
    }
    catch (error) {
        next(error);
    }
}));
exports.challenge_stats = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Got Challenge Stats');
    let easyChallenges = yield challenge_1.default.countDocuments({ difficulty: difficulty_1.Difficulty.EASY });
    let mediumChallenges = yield challenge_1.default.countDocuments({ difficulty: difficulty_1.Difficulty.MEDIUM });
    let hardChallenges = yield challenge_1.default.countDocuments({ difficulty: difficulty_1.Difficulty.HARD });
    let extremeChallenges = yield challenge_1.default.countDocuments({ difficulty: difficulty_1.Difficulty.EXTREME });
    let totalChallenges = yield challenge_1.default.countDocuments();
    res.status(200).json({
        easyChallenges,
        mediumChallenges,
        hardChallenges,
        extremeChallenges,
        totalChallenges
    });
}));
