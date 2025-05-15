package com.drinkster.dto.response;

public record PlayerStatusResponse(String roomId, String playerId, boolean isReady) implements BaseResponse { }
