package com.drinkster.dto.request;

public record JoinRequest(String roomId, CreateRoomRequest.PlayerConfig playerConfig) {}
