package com.drinkster.model.enums;

import java.util.Arrays;


public enum Sex {
    MALE("M"),
    FEMALE("F"),
    ALL("A");

    private final String dbCode;

    Sex(String dbCode) {
        this.dbCode = String.valueOf(dbCode);
    }

    public static Sex fromDbCode(String dbCode) {
        return Arrays.stream(values())
                .filter(s -> s.dbCode.equals(dbCode))
                .findFirst()
                .orElseThrow(IllegalArgumentException::new);
    }

}
