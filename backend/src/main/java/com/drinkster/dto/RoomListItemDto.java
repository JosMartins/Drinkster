package com.drinkster.dto;

import com.drinkster.model.GameRoom;

public record RoomListItemDto(
        String id,
        String name,
        boolean isPrivate,
        int players,
        String state
) {
    public static RoomListItemDto fromGameRoom(GameRoom gameRoom) {
        return new RoomListItemDto(
                gameRoom.getId().toString(),
                gameRoom.getName(),
                gameRoom.isPrivate(),
                gameRoom.getPlayers().size(),
                gameRoom.getState().toString()
        );
    }
}
