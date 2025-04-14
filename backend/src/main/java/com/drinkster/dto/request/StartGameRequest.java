package com.drinkster.dto.request;

public record StartGameRequest(
        String roomId,
        String playerId
        ) { }
