package com.drinkster.model.enums;

import java.util.Arrays;
import java.util.Objects;

public enum Difficulty {
    EASY("EASY"),
    MEDIUM("MEDIUM"),
    HARD("HARD"),
    EXTREME("EXTREME");

    private final String value;

    Difficulty(String value) {
        this.value = value;
    }


    public static Difficulty fromValue(String value) {
        return Arrays.stream(values())
                .filter(d -> Objects.equals(d.value, value))
                .findFirst()
                .orElseThrow(IllegalArgumentException::new);
    }
}
