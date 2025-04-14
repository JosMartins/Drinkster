package com.drinkster.dto;

import com.drinkster.model.GameRoom;

public record GameRoomDto(
        String roomId,
        String roomName,
        boolean isPrivate,
        String roomState,
        String roomMode,
        int playerCount,
        int rememberedChallenges,
        String adminId) {

    public static GameRoomDto fromGameRoom(GameRoom gameRoom) {
        return new GameRoomDto(
                gameRoom.getId().toString(),
                gameRoom.getName(),
                gameRoom.isPrivate(),
                gameRoom.getState().toString(),
                gameRoom.getMode().toString(),
                gameRoom.getPlayers().size(),
                gameRoom.getRememberedChallenges(),
                gameRoom.getAdmin().getId().toString()
        );
    }
}