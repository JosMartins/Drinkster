package com.drinkster.dto.request;


import com.drinkster.model.DifficultyValues;

/**
 * Represents a request to create a new game room.
 *
 * @param name The name of the room.
 * @param isPrivate Indicates if the room is private.
 * @param password The password for the room (if private).
 * @param player Configuration for the player.
 * @param mode The game mode.
 * @param rememberCount The number of rounds to remember.
 * @param showChallenges Indicates if challenges should be shown.
 */
public record CreateRoomRequest (
        String name,
        boolean isPrivate,
        String password,
        PlayerConfig player,
        String mode,
        int rememberCount,
        boolean showChallenges
) {
    public record PlayerConfig(
        String name,
        String sex,
        DifficultyValues difficulty_values
    ) { }
}

