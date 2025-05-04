package com.drinkster.model.enums;

import java.util.Arrays;
import java.util.Objects;

public enum ChallengeType {
    EVERYONE_DRINK("EVERYONE_DRINK"),
    CHOSEN_DRINK("CHOSEN_DRINK"),
    YOU_DRINK("YOU_DRINK"),
    BOTH_DRINK("BOTH_DRINK");

    private final String value;

    ChallengeType(final String value) {
        this.value = value;
    }

    public static ChallengeType fromValue(final String value) {
        return Arrays.stream(values())
                .filter(cT -> Objects.equals(cT.value, value))
                .findFirst()
                .orElseThrow(IllegalArgumentException::new);
    }


}
