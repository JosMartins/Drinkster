package com.drinkster.dto.response;

public record PlayerStatusResponse(String playerId, boolean isReady) implements BaseResponse { }
