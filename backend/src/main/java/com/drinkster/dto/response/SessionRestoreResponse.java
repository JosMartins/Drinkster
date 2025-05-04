package com.drinkster.dto.response;

import com.drinkster.dto.PlayerDto;
import com.drinkster.dto.GameRoomDto;

public record SessionRestoreResponse(PlayerDto self,
                                     GameRoomDto room,
                                     ChallengeDto currentChallenge) implements BaseResponse { }
