package com.drinkster.model.enums;

import java.util.Arrays;

public enum Difficulty {
    EASY(1),
    MEDIUM(2),
    HARD(3),
    EXTREME(4);

    private final int value;

    Difficulty(int value) {
        this.value = value;
    }


    public static Difficulty fromValue(int value) {
        return Arrays.stream(values())
                .filter(d -> d.value == value)
                .findFirst()
                .orElseThrow(IllegalArgumentException::new);
    }
}
