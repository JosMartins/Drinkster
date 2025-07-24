package com.drinkster.dto.request;

/**
 * Represents a request to get the difficulty level of a player in a game room.
 *
 * @param roomId The ID of the room where the player is located.
 * @param playerId The ID of the player whose difficulty level is being requested.
 */
public record PlayerDifficultyRequest(String roomId, String playerId) {
}
