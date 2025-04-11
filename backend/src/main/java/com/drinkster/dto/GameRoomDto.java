package com.drinkster.dto;


public record GameRoomDto (String roomId,
                           String roomName,
                           boolean isPrivate,
                           String roomState,
                           String roomMode,
                           int playerCount,
                           int rememberedChallenges,
                           String adminId) {  }
