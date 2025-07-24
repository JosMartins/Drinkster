package com.drinkster.dto.response;

/**
 * JoinResponse represents the response sent when a player joins a game room.
 *
 * @param message A message indicating the result of the join operation, such as success or failure.
 * @param playerId The ID of the player who has joined the room.
 */
public record JoinResponse(String message ,String playerId) implements BaseResponse { }
