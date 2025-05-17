package com.drinkster.dto.response;

import com.drinkster.dto.*;

public record SessionRestoreResponse(PlayerDto self,
                                     GameRoomDto room,
                                     PenaltyDto[] penalties,
                                     PlayerTurnDto playerTurn) implements BaseResponse { }
