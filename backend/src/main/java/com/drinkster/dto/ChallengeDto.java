package com.drinkster.dto;

import com.drinkster.model.Challenge;

/**
 * ChallengeDto represents a data transfer object for a challenge.
 * It contains the text of the challenge, its difficulty level, and its type.
 *
 * @param text The text of the challenge.
 * @param difficulty The difficulty level of the challenge.
 * @param type The type of the challenge.
 * @param ai Indicates if the challenge is AI-generated.
 */
public record ChallengeDto(String text,
                           String difficulty,
                           String type,
                           boolean ai) {

    public static ChallengeDto fromChallenge(Challenge challenge) {
        return new ChallengeDto(challenge.getText(), challenge.getDifficulty().toString(), challenge.getType().toString(), challenge.isAi());
    }
}
