package com.drinkster.model;

import com.drinkster.dto.DifficultyDto;
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
public class DifficultyValues {
    private double easy = 0.3;
    private double medium= 0.35;
    private double hard = 0.35;
    private double extreme = 0;

    public Map<Difficulty, Double> getMapping() {
        return Map.of(
                Difficulty.EASY, easy,
                Difficulty.MEDIUM, medium,
                Difficulty.HARD, hard,
                Difficulty.EXTREME, extreme
        );
    }

    public DifficultyValues fromDto(DifficultyDto difficultyDto) {
        this.easy = difficultyDto.easy();
        this.medium = difficultyDto.medium();
        this.hard = difficultyDto.hard();
        this.extreme = difficultyDto.extreme();
        return this;
    }
}
