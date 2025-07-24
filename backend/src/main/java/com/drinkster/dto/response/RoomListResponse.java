package com.drinkster.dto.response;

import com.drinkster.dto.RoomListItemDto;

/**
 * RoomListResponse represents the response containing a list of game rooms.
 *
 * @param rooms An array of RoomListItemDto representing the rooms available. ({@link RoomListItemDto})
 */
public record RoomListResponse(RoomListItemDto[] rooms) { }
