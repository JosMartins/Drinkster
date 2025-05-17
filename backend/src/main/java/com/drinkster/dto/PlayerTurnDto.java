package com.drinkster.dto;

import com.drinkster.model.PlayerTurn;

public record PlayerTurnDto(PlayerDto player,
                            ChallengeDto challenge,
                            PlayerDto[] affectedPlayers) {

    public static PlayerTurnDto fromPlayerTurn(PlayerTurn currentTurn) {
        return new PlayerTurnDto(
                PlayerDto.fromPlayer(currentTurn.getPlayer()),
                ChallengeDto.fromChallenge(currentTurn.getChallenge()),
                currentTurn.getAffectedPlayers().stream()
                        .map(PlayerDto::fromPlayer)
                        .toArray(PlayerDto[]::new)
        );
    }
}
