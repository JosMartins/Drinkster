package com.drinkster.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

/**
 * CreateChallengeRequest represents a request to create a new challenge.
 * It includes fields for the c
 *
 * @param text The text of the challenge.
 * @param difficulty The difficulty level of the challenge.
 * @param sexes An array of "M" or "F" or "All" representing the player's allowed sexes.
 * @param players The number of players required for the challenge.
 * @param sips The number of sips required for the challenge.
 * @param type The type of the challenge {@link com.drinkster.model.enums.ChallengeType}.
 * @param penalty The penalty associated with the challenge.
 *
 */
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
