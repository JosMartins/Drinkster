package com.drinkster.dto;

import com.drinkster.model.Penalty;

public record PenaltyDto(String text, int rounds) {

    public static PenaltyDto fromPenalty(Penalty penalty) {
        return new PenaltyDto(penalty.getText(), penalty.getRounds());
    }
}
