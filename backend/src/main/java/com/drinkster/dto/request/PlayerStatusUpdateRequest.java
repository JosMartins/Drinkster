package com.drinkster.dto.request;

/**
 * * Represents a request to update the status of a player in a game room.
 *
 * @param roomId The ID of the room where the player is located.
 * @param playerId The ID of the player whose status is being updated.
 */
public record PlayerStatusUpdateRequest(String roomId, String playerId) {
}
