package com.drinkster.dto;

import com.drinkster.model.Player;

public record PlayerDto(
        String id,
        String name,
        String sex,
        boolean isAdmin,
        boolean isReady,
        boolean isPlaying
) {
    public static PlayerDto fromPlayer(Player player) {
        return new PlayerDto(
                player.getId().toString(),
                player.getName(),
                player.getSex().toString(),
                player.isAdmin(),
                player.isReady(),
                player.isPlaying()
        );
    }
}
