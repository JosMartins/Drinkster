package com.drinkster.dto;

import com.drinkster.model.DifficultyValues;

/**
 * DifficultyDto represents the difficulty levels of a game challenge.
 * It contains values for easy, medium, hard, and extreme difficulties.
 *
 * @param easy The value for easy difficulty.
 * @param medium The value for medium difficulty.
 * @param hard The value for hard difficulty.
 * @param extreme The value for extreme difficulty.
 */
public record DifficultyDto(
        double easy,
        double medium,
        double hard,
        double extreme
) {
    public static DifficultyDto fromDifficultyValues(DifficultyValues difficulty) {
        return new DifficultyDto(
                difficulty.getEasy(),
                difficulty.getMedium(),
                difficulty.getHard(),
                difficulty.getExtreme()
        );
    }
}
