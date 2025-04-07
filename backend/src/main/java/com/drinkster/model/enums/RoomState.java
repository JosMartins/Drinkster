package com.drinkster.model.enums;

import lombok.Getter;

import java.util.Map;
import java.util.Set;

@Getter
public enum RoomState {
    LOBBY("Lobby"),
    PLAYING("Playing"),
    FINISHED("Finished");

    private final String state;


    private static final Map<RoomState, Set<RoomState>> transitions = Map.of(
            LOBBY, Set.of(PLAYING),
            PLAYING, Set.of(PLAYING, FINISHED)
    );

    public boolean canTransitionTo(RoomState newState) {
        return transitions.get(this).contains(newState);
    }

    RoomState(String state) {
        this.state = state;
    }

}
