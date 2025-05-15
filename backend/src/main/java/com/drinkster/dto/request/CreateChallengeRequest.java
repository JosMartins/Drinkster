package com.drinkster.dto.request;


public record CreateChallengeRequest (
        String text,
        String difficulty,
        String[] sexes,
        int players,
        int sips,
        String type,
        PenaltyRequest penalty
) {
    public record PenaltyRequest(
            String text,
            int rounds
    ) { }
}
