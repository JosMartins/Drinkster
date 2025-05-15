package com.drinkster.dto.response;

import com.drinkster.dto.RoomListItemDto;

import java.util.List;

public record RoomListResponse(List<RoomListItemDto> rooms) { }
