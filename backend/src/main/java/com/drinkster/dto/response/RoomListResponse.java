package com.drinkster.dto.response;

import com.drinkster.model.GameRoom;

import java.util.List;

public record RoomListResponse(List<GameRoom> rooms) { }
