package com.drinkster.dto.response;

import com.drinkster.dto.PlayerDto;
import com.drinkster.dto.GameRoomDto;
import com.drinkster.dto.PenaltyDto;
import com.drinkster.dto.PlayerTurnDto;

/**
 * SessionRestoreResponse represents the response when a session is restored.
 *
 * @param self The PlayerDto representing the player restoring the session. ({@link PlayerDto})
 * @param room The GameRoomDto representing the game room being restored. ({@link GameRoomDto})
 * @param penalties An array of PenaltyDto representing any penalties associated with the session. ({@link PenaltyDto})
 * @param playerTurn The PlayerTurnDto representing the current player's turn in the game. ({@link PlayerTurnDto})
 */
public record SessionRestoreResponse(PlayerDto self,
                                     GameRoomDto room,
                                     PenaltyDto[] penalties,
                                     PlayerTurnDto playerTurn) implements BaseResponse { }
