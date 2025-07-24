package com.drinkster.dto.request;

/**
 * Represents a request to leave a game room.
 * This record contains the room ID and player ID of the player who is leaving.
 *
 * @param roomId The ID of the room the player is leaving.
 * @param playerId The ID of the player who is leaving the room.
 */
public record LeaveRequest(String roomId, String playerId) {
}
