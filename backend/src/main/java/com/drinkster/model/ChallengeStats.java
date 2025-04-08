package com.drinkster.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
}