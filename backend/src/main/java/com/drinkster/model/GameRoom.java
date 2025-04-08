package com.drinkster.model;

import com.drinkster.model.enums.RoomMode;
import com.drinkster.model.enums.RoomState;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
public class GameRoom {

    private UUID id;
    private String name;
    private boolean isPrivate;
    private String password;
    private Player admin;
    private List<Player> players;
    private RoomState state;
    private RoomMode mode;
    private int rememberedChallenges;
    private boolean showChallenges;
    private Challenge currentChallenge;
    private int currentPlayerIndex;


    public GameRoom(String name, boolean isPrivate, String password, Player admin, RoomMode mode) {
        this.id = UUID.randomUUID();
        this.name = name;
        this.isPrivate = isPrivate;
        this.password = password;
        this.admin = admin;
        this.players = List.of(admin);
        this.state = RoomState.LOBBY;
        this.mode = mode;
        this.rememberedChallenges = 0;
        this.showChallenges = false;
        this.currentChallenge = null;
        this.currentPlayerIndex = 0;
    }

    public void addPlayer(Player player) {
        if (state == RoomState.LOBBY) {
            players.add(player);
        }
    }

    public void removePlayer(Player player) {
        players.remove(player);
    }

    public void startGame() {
        if (players.size() >= 2 && state == RoomState.LOBBY) {
            state = RoomState.PLAYING;

        } else {
            throw new IllegalStateException("Cannot start game from current state: " + state);
        }
    }

    public Player getCurrentPlayer() {
        if (players.isEmpty()) return null;
        return players.get(currentPlayerIndex);
    }

    public void nextPlayer() {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.size();
    }


    public void endGame() {
        if (state.canTransitionTo(RoomState.FINISHED)) {
            state = RoomState.FINISHED;
        } else {
            throw new IllegalStateException("Cannot end game from current state: " + state);
        }
    }


}
