package com.drinkster.model;

import lombok.Getter;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Getter
public class PlayerTurn {
    private final Player player;
    private final Challenge challenge;
    private final List<Player> affectedPlayers;
    private final Map<UUID, Boolean> responses = new ConcurrentHashMap<>();

    public PlayerTurn(Player player, Challenge challenge, List<Player> affectedPlayers) {
        this.player = player;
        this.challenge = challenge;
        this.affectedPlayers = new ArrayList<>(affectedPlayers);
        initResponses();
    }

    private void initResponses() {
        for (Player p : affectedPlayers) {
            responses.put(p.getId(), null);
        }
    }

    public void registerResponse(UUID player, boolean drank) {
        responses.put(player, drank);
    }

    public boolean allResponded() {
        return responses.values().stream().allMatch(Objects::nonNull);
    }

    public boolean anyDrink() {
        return responses.values().stream().anyMatch(Boolean::booleanValue);
    }

    public boolean allDrink() {
        return responses.values().stream().allMatch(Boolean::booleanValue);
    }

}