package com.drinkster.model;

import com.drinkster.model.enums.ResponseState;
import lombok.Getter;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Getter
public class PlayerTurn {
    private final Player player;
    private final Challenge challenge;
    private final List<Player> affectedPlayers;
    private final Map<UUID, ResponseState> responses = new ConcurrentHashMap<>();

    public PlayerTurn(Player player, Challenge challenge, List<Player> affectedPlayers) {
        this.player = player;
        this.challenge = challenge;
        this.affectedPlayers = affectedPlayers != null ?
                affectedPlayers.stream().filter(Objects::nonNull).toList() :
                new ArrayList<>();

        initResponses();
    }

    private void initResponses() {
        for (Player p : affectedPlayers) {
            if (p != null && p.getId() != null) {
                responses.put(p.getId(), ResponseState.PENDING);
            }
        }
    }


    public void registerResponse(UUID player, boolean drank) {
        if (player != null) {
            responses.put(player, drank ? ResponseState.DRANK : ResponseState.COMPLETED);
        }
    }

    public boolean allResponded() {
        return !responses.isEmpty() && responses.values().stream().noneMatch(ResponseState.PENDING::equals);
    }

    public boolean anyDrink() {
        return responses.values().stream().anyMatch(ResponseState.DRANK::equals);
    }

    public boolean allDrink() {
        return !responses.isEmpty() && responses.values().stream().allMatch(ResponseState.DRANK::equals);
    }


    public List<Player> playersDrunk() {
        List<Player> playersDrunk = new ArrayList<>();
        for (Map.Entry<UUID, ResponseState> entry : responses.entrySet()) {
            if (entry.getValue().equals(ResponseState.DRANK)) {
                playersDrunk.add(affectedPlayers.stream().filter(p -> p.getId().equals(entry.getKey())).findFirst().orElse(null));
            }
        }
        return playersDrunk;
    }

    public List<Player> playersCompleted() {
        List<Player> playersNotDrunk = new ArrayList<>();
        for (Map.Entry<UUID, ResponseState> entry : responses.entrySet()) {
            if (entry.getValue().equals(ResponseState.COMPLETED)) {
                playersNotDrunk.add(affectedPlayers.stream().filter(p -> p.getId().equals(entry.getKey())).findFirst().orElse(null));
            }
        }
        return playersNotDrunk;
    }
}