package com.drinkster.model.enums;

import java.util.Arrays;


public enum Sex {
    MALE("M"),
    FEMALE("F"),
    ALL("ALL");

    private final String dbCode;

    Sex(String dbCode) {
        this.dbCode = String.valueOf(dbCode);
    }

    public static Sex fromDbCode(String dbCode) {
        return Arrays.stream(values())
                .filter(s -> s.dbCode.equals(dbCode))
                .findFirst()
                .orElse(null);
    }

}
