package com.drinkster.dto.response;

import com.drinkster.dto.DifficultyDto;

/**
 * GetPlayerDifficultyResponse represents the response containing the difficulty level of a player.
 *
 * @param difficulty The difficulty level of the player, represented as a {@link DifficultyDto}.
 */
public record GetPlayerDifficultyResponse(DifficultyDto difficulty) implements BaseResponse {  }
