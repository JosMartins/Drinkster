package com.drinkster.dto.response;

/**
 * PlayerStatusResponse represents the response containing the status of a player in a game room.
 *
 * @param playerId The ID of the player whose status is being reported.
 * @param isReady Indicates whether the player is ready to play or not.
 */
public record PlayerStatusResponse(String playerId, boolean isReady) implements BaseResponse { }
