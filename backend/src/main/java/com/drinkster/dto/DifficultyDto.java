package com.drinkster.dto;

import com.drinkster.model.DifficultyValues;

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
