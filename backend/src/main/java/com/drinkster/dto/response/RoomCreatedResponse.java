package com.drinkster.dto.response;

/**
 * RoomCreatedResponse represents the response when a new game room is created.
 *
 * @param roomId The ID of the newly created room.
 * @param playerId The ID of the player who created the room.
 */
public record RoomCreatedResponse(String roomId, String playerId) { }
