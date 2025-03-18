import express from 'express';
import * as challenge_controller from '../controllers/challengeController';

const router = express.Router();

// Get a challenge
router.get('/', challenge_controller.get_challenge);

// Get an easy challenge
router.get('/easy', challenge_controller.get_easy_challenge);

// Get a Medium challenge
router.get('/medium', challenge_controller.get_medium_challenge);

// Get a Hard challenge
router.get('/hard', challenge_controller.get_hard_challenge);

// Get an Extreme Challenge
router.get('/extreme', challenge_controller.get_extreme_challenge);

// Get all Challenges
router.get('/all', challenge_controller.get_all_challenges);

// Save a challenge
router.post('/add', challenge_controller.add_challenge);

// Saves all challenges from a list
router.post('/add-all', challenge_controller.add_all_challenges);

// Delete a challenge
router.delete('/delete/:id', challenge_controller.delete_challenge);

// Get Challenge Stats
router.get('/stats', challenge_controller.challenge_stats);

export default router;