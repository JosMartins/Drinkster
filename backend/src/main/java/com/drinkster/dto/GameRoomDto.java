package com.drinkster.dto;

import com.drinkster.model.GameRoom;

/**
 * GameRoomDto represents a data transfer object for a game room.
 *
 * @param roomId
 * @param roomName
 * @param isPrivate
 * @param players
 * @param roomState
 * @param roomMode
 * @param rememberedChallenges
 * @param adminId
 */
public record GameRoomDto(
        String roomId,
        String roomName,
        boolean isPrivate,
        PlayerDto[] players,
        String roomState,
        String roomMode,
        int rememberedChallenges,
        String adminId) {

    public static GameRoomDto fromGameRoom(GameRoom gameRoom) {
        return new GameRoomDto(
                gameRoom.getId().toString(),
                gameRoom.getName(),
                gameRoom.isPrivate(),
                gameRoom.getPlayers().stream()
                        .map(PlayerDto::fromPlayer)
                        .toArray(PlayerDto[]::new),
                gameRoom.getState().toString(),
                gameRoom.getMode().toString(),
                gameRoom.getRememberedChallenges(),
                gameRoom.getAdmin().getId().toString()
        );
    }
}