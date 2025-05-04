package com.drinkster.model;

import com.drinkster.model.enums.Difficulty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeStats {
    private int easyChallenges = 1;
    private int mediumChallenges = 1;
    private int hardChallenges = 1;
    private int extremeChallenges = 1;
    private int totalChallenges = 4;


    public Map<Difficulty, Integer> getMapping() {
        return Map.of(
                Difficulty.EASY, easyChallenges,
                Difficulty.MEDIUM, mediumChallenges,
                Difficulty.HARD, hardChallenges,
                Difficulty.EXTREME, extremeChallenges
        );
    }
}