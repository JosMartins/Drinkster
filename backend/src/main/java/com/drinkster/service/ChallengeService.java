package com.drinkster.service;

import com.drinkster.model.Challenge;
import com.drinkster.model.ChallengeStats;
import com.drinkster.model.DifficultyValues;
import com.drinkster.model.enums.Difficulty;
import com.drinkster.repository.ChallengeRepository;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service class for managing challenges.
 */
@Service
public class ChallengeService {

    private final ChallengeRepository challengeRepository;

    private ChallengeStats challengeStats;

    public ChallengeService(ChallengeRepository challengeRepository) {

        this.challengeRepository = challengeRepository;

        this.challengeStats = getChallengeStats();
    }


    /**
     * Get a random challenge, optionally excluding certain IDs and filtering by difficulty.
     *
     * @param excludeIds a list of challenge IDs to exclude
     * @param difficulty the difficulty level to filter by
     * @return a random challenge.
     */
    public Challenge getRandomChallenge(List<UUID> excludeIds, Difficulty difficulty) {
        if (excludeIds != null && !excludeIds.isEmpty() && difficulty != null) {
            return challengeRepository.findRandomChallengeExcludingWithDifficulty(excludeIds, difficulty.toString());
        } else if (excludeIds != null && !excludeIds.isEmpty()) {
            return challengeRepository.findRandomChallengeExcluding(excludeIds);
        } else if (difficulty != null) {
            return challengeRepository.findRandomChallengeByDifficulty(difficulty.toString());
        }

        return challengeRepository.findRandomChallenge();
    }

    /**
     * Get the count of challenges by difficulty and the total.
     *
     *  @return a map with the count of challenges by difficulty and the total count.
     */
    public ChallengeStats getChallengeStats() {
        return new ChallengeStats(
                challengeRepository.countByDifficulty(Difficulty.EASY),
                challengeRepository.countByDifficulty(Difficulty.MEDIUM),
                challengeRepository.countByDifficulty(Difficulty.HARD),
                challengeRepository.countByDifficulty(Difficulty.EXTREME),
                challengeRepository.countAll()
        );
    }


    // CRUD operations

    /**
     * Find a challenge by its ID.
     *
     * @param id the ID of the challenge
     * @return the challenge with the given ID, or null if not found
     */
    public Challenge findById(UUID id) {
        return challengeRepository.findById(id).orElse(null);
    }

    /**
     * Find All challenges.
     *
     * @return a list of all challenges
     */
    public List<Challenge> findAll() {
        return challengeRepository.findAll();
    }

    /**
     * Find a challenge by its difficulty.
     *
     * @param difficulty the difficulty of the challenge
     * @return a list of challenges with the given difficulty
     */
    public List<Challenge> findByDifficulty(Difficulty difficulty) {
        return challengeRepository.findByDifficulty(difficulty);
    }

    /**
     * Save a challenge to the database.
     *
     * @param challenge the challenge to save
     * @return the saved challenge
     */
    public Challenge save(Challenge challenge) {

        Challenge ret = challengeRepository.save(challenge);
        // Update the challenge stats after saving
        this.challengeStats = getChallengeStats();
        return ret;
    }

    /**
     * Update an existing challenge.
     *
     * @param id the ID of the challenge to update
     * @param updatedChallenge the updated challenge data
     * @return the updated challenge
     */
    public Challenge update(UUID id, Challenge updatedChallenge) {
        return challengeRepository.findById(id)
                .map(challenge -> {
                    challenge.setText(updatedChallenge.getText());
                    challenge.setDifficulty(updatedChallenge.getDifficulty());
                    challenge.setSexes(updatedChallenge.getSexes());
                    challenge.setPlayers(updatedChallenge.getPlayers());
                    challenge.setSips(updatedChallenge.getSips());
                    challenge.setType(updatedChallenge.getType());
                    return challengeRepository.save(challenge);
                })
                .orElse(null);
    }

    /**
     * Delete a challenge by its ID.
     *
     * @param id the ID of the challenge to delete
     */
    public void deleteById(UUID id) {
        challengeRepository.deleteById(id);
        // Update the challenge stats after deletion
        this.challengeStats = getChallengeStats();
    }

    // HELPER //

    /**
     * Get a random difficulty based on user weights and challenge stats.
     *
     * @param values the user-defined difficulty values
     * @return a random difficulty based on the weights
     */
    public Difficulty getRandomWeightedDifficulty(DifficultyValues values) {
        Map<Difficulty, Integer> difficultyWeights = challengeStats.getMapping();
        Map<Difficulty, Double> userWeights = values.getMapping();

        double totalWeight = 0;
        Map<Difficulty, Double> weights = new EnumMap<>(Difficulty.class);

        for (Difficulty difficulty : Difficulty.values()) {
            double weight = (userWeights.get(difficulty) * difficultyWeights.get(difficulty)) / 100;
            weights.put(difficulty, weight);
            totalWeight += weight;
        }

        if (totalWeight == 0) {
            // If all weights are zero, return a random difficulty
            System.err.println("All weights are zero. Defaulting to HARD.");
            return Difficulty.HARD;
        }

        // Normalize
        for (Difficulty diff : Difficulty.values()) {
            weights.put(diff, weights.get(diff) / totalWeight);
        }

        // Random selection
        double rand = Math.random();
        double cumulative = 0.0;
        for (Difficulty diff : Difficulty.values()) {
            cumulative += weights.get(diff);
            if (rand < cumulative) {
                return diff;
            }
        }

        return null; // Should not happen if weights are correct
    }

}
