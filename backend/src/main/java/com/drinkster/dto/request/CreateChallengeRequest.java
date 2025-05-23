package com.drinkster.dto.request;


import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateChallengeRequest (
        @NotBlank(message = "Text cannot be blank") String text,
        @NotBlank(message = "Difficulty cannot be blank") String difficulty,
        String[] sexes,
        @Min(value = 0, message = "players cannot be negative") int players,
        @Min(value = 0, message = "Sips cannot be negative") int sips,
        @NotBlank(message = "Type cannot be blank") String type,
        PenaltyRequest penalty
) {
    public record PenaltyRequest(
            @NotBlank(message = "Penalty text cannot be blank") String text,
            @Positive(message = "Rounds neds to be at least one") int rounds
    ) { }
}
