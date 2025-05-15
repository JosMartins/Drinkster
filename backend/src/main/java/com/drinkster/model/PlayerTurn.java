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


    public List<Player> playersDrunk() {
        List<Player> playersDrunk = new ArrayList<>();
        for (Map.Entry<UUID, Boolean> entry : responses.entrySet()) {
            if (entry.getValue() != null && entry.getValue()) {
                playersDrunk.add(affectedPlayers.stream().filter(p -> p.getId().equals(entry.getKey())).findFirst().orElse(null));
            }
        }
        return playersDrunk;
    }

    public List<Player> playersCompleted() {
        List<Player> playersNotDrunk = new ArrayList<>();
        for (Map.Entry<UUID, Boolean> entry : responses.entrySet()) {
            if (entry.getValue() != null && !entry.getValue()) {
                playersNotDrunk.add(affectedPlayers.stream().filter(p -> p.getId().equals(entry.getKey())).findFirst().orElse(null));
            }
        }
        return playersNotDrunk;
    }
}