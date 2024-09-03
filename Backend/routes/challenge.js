const express = require('express');
const router = express.Router();
const challenge_controller = require('../controllers/challengeController');

//Get a challenge
router.get('/',challenge_controller.get_challenge);

//Get an easy challenge
router.get('/easy', challenge_controller.get_easy_challenge);

//Get a Medium challenge
router.get('/medium',challenge_controller.get_medium_challenge);

//Get a Hard challenge
router.get('/hard',challenge_controller.get_hard_challenge);

//Get an Extreme Challenge
router.get('/extreme',challenge_controller.get_extreme_challenge);

//Get all Challenges
router.get('/all', challenge_controller.get_all_challenges);


//Save a challenge
router.post('/add',challenge_controller.add_challenge);

//Saves all challenges from a list
router.post('/add-all',challenge_controller.add_all_challenges);
module.exports = router;