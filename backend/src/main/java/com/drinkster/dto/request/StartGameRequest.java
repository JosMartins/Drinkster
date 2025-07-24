package com.drinkster.dto.request;

/**
 * Represents a request to start a game in a specific room.
 *
 * @param roomId The ID of the room where the game is being started.
 * @param playerId The ID of the player who is starting the game.
 */
public record StartGameRequest(String roomId, String playerId) { }
