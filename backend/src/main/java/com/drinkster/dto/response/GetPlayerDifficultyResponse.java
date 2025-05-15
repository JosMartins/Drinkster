package com.drinkster.dto.response;

import com.drinkster.dto.DifficultyDto;

public record GetPlayerDifficultyResponse(DifficultyDto difficulty) implements BaseResponse {  }
