package com.drinkster.dto.request;

/**
 * SessionRestoreRequest represents a request to restore a player's session in a game room.
 *
 * @param roomId The ID of the room where the session is being restored.
 * @param playerId The ID of the player whose session is being restored.
 */
public record SessionRestoreRequest(String roomId, String playerId) {
}
