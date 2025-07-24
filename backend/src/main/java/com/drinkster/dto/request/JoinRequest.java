package com.drinkster.dto.request;

/**
 * JoinRequest represents a request to join an existing game room.
 *
 * @param roomId The ID of the room to join.
 * @param playerConfig Configuration for the player joining the room ({@link com.drinkster.dto.request.CreateRoomRequest.PlayerConfig})
 */
public record JoinRequest(String roomId, CreateRoomRequest.PlayerConfig playerConfig) {}
