package com.drinkster.model;

import com.drinkster.model.enums.RoomMode;
import com.drinkster.model.enums.RoomState;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Random;
import java.util.UUID;

/**
 * Represents a game room where players can join and play.
 */
@Getter
@Setter
public class GameRoom {
    private static final int SIPS_PER_GLASS = 20;
    private Random random = new Random();

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
    private int currentPlayerIndex;
    private PlayerTurn currentTurn;



    /**
     * Constructor for creating a new game room.
     *
     * @param roomName The name of the room.
     * @param isPrivate Whether the room is private or public.
     * @param password The password for the room. if {@code !isPrivate} this field should be null.
     * @param admin The admin player who created the room.
     * @param mode The mode of the game (e.g., normal, random).
     * @param rememberedChallenges The number of challenges to remember.
     * @param showChallenges Whether to show challenges to all players.
     */
    public GameRoom(String roomName, boolean isPrivate, String password, Player admin, RoomMode mode, int rememberedChallenges, boolean showChallenges) {
        this.id = UUID.randomUUID();
        this.name = roomName;
        this.isPrivate = isPrivate;
        this.password = isPrivate ? password : null;
        this.admin = admin;
        this.players = List.of(admin);
        this.state = RoomState.LOBBY;
        this.mode = mode;
        this.rememberedChallenges = rememberedChallenges;
        this.showChallenges = showChallenges;
        this.currentPlayerIndex = 0;
    }

    /**
     * Adds a player to the game room.
     *
     * @param player The player to add.
     */
    public void addPlayer(Player player) {
        if (state == RoomState.LOBBY) {
            players.add(player);
        }
    }

    /**
     * Removes a player from the game room.
     *
     * @param player The player to remove.
     */
    public void removePlayer(Player player) {
        players.remove(player);
    }


    /**
     * Starts the game if there are at least 2 players and the room is in the LOBBY state.
     *
     */
    public void startGame() {
        if (players.size() >= 2 && state == RoomState.LOBBY) {
            state = RoomState.PLAYING;

        } else {
            throw new IllegalStateException("Cannot start game from current state: " + state);
        }

    }

    /**
     * Ends the game if the room is in the {@code PLAYING} state.
     */
    public void endGame() {
        if (state.canTransitionTo(RoomState.FINISHED)) {
            state = RoomState.FINISHED;
        } else {
            throw new IllegalStateException("Cannot end game from current state: " + state);
        }
    }

    /**
     * Returns the current player.
     *
     * @return The current player, or null if there are no players.
     */
    public Player getCurrentPlayer() {
        if (players.isEmpty()) return null;
        return players.get(currentPlayerIndex);
    }

    /**
     * Advances to the next player in the list and returns them.
     * If the current player is the last in the list, it wraps around to the first player.
     *
     * @return The next player, or null if there are no players.
     */
    public Player nextPlayer() {
        if (players.isEmpty()) return null;
        currentPlayerIndex = (currentPlayerIndex + 1) % players.size();

        return players.get(currentPlayerIndex);
    }

    /**
     * Returns a random player from the list of players, excluding the specified players.
     *
     * @param playersToExclude a list of players to exclude from the random selection
     *
     * @return a random player from the list, or null if no players are available
     */
    public Player getRandomPlayer(List<Player> playersToExclude) {
        if (players.isEmpty()) return null;
        List<Player> availablePlayers = players.stream()
                .filter(player -> !playersToExclude.contains(player))
                .toList();
        if (availablePlayers.isEmpty()) return null;
        int randomIndex = random.nextInt(availablePlayers.size());
        return availablePlayers.get(randomIndex);
    }

    /**
     * Returns the player with the specified ID.
     *
     * @param playerID the ID of the player to find
     *
     * @return the player with the specified ID, or null if not found
     */
    public Player getPlayer(UUID playerID) {
        return players.stream()
                .filter(player -> player.getId().equals(playerID))
                .findFirst()
                .orElse(null);
    }

    /// Game functions ///

    /**
     *
     */
    public void nextTurn() {
        Player player = nextPlayer();
        Challenge challenge = new Challenge(); // TODO: Implement challenge fetching logic

        this.currentTurn = new PlayerTurn(player, challenge);

    }

    /**
     * Handles the completion of a challenge.
     *
     * @param success true if the challenge was completed successfully, false if the player drank
     */
    public void handleChallengeCompletion(boolean success) {

        //TODO: Implement logic to handle the completion of a challenge.


        nextTurn();
    }
}
