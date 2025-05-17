package com.drinkster.dto.request;

import com.drinkster.dto.DifficultyDto;

public record PlayerDifficultyUpdateRequest(String roomId,
                                            String playerId,
                                            DifficultyDto difficulty_values) {
}
