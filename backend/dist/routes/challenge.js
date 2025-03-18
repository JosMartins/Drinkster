"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const challenge_controller = __importStar(require("../controllers/challengeController"));
const router = express_1.default.Router();
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
exports.default = router;
