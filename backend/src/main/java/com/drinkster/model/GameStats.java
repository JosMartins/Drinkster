package com.drinkster.model;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class GameStats {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private int completedChallenges;
    private int totalRounds;

    public GameStats() {
        this.completedChallenges = 0;
        this.totalRounds = 0;
    }

    public void incrementTotalRounds() {
        this.totalRounds++;
    }

    public void incrementCompletedChallenges() {
        this.completedChallenges++;
    }
}