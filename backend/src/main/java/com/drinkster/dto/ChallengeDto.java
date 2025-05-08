package com.drinkster.dto;

import com.drinkster.model.Challenge;

public record ChallengeDto(String text, String difficulty, String type) {

    public static ChallengeDto fromChallenge(Challenge challenge) {
        return new ChallengeDto(challenge.getText(), challenge.getDifficulty().toString(), challenge.getType().toString());
    }
}
