package com.drinkster.model;

import com.drinkster.exception.IncompatibleSexException;
import com.drinkster.model.enums.*;
import com.drinkster.utils.FixedSizeQueue;
import lombok.Getter;
import lombok.Setter;

import java.util.*;

/**
 * Represents a game room where players can join and play.
 */
@Getter
@Setter
public class GameRoom {
    private Random random = new Random();

    private UUID id;
    private String name;
    private boolean isPrivate;
    private String password;
    private Player admin;
    private ArrayList<Player> players;
    private RoomState state;
    private RoomMode mode;
    private int rememberedChallenges;
    private boolean showChallenges;
    private int currentPlayerIndex;
    private PlayerTurn currentTurn = null;
    private int roundNumber = 0;

    //challenge tracker
    private FixedSizeQueue<UUID> usedUUIDS;


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
        this.players = new ArrayList<>();
        this.players.add(admin);
        this.state = RoomState.LOBBY;
        this.mode = mode;
        this.rememberedChallenges = rememberedChallenges;
        this.showChallenges = showChallenges;
        this.currentPlayerIndex = 0;
        this.usedUUIDS = new FixedSizeQueue<>(rememberedChallenges);
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
            this.currentTurn = new PlayerTurn(getCurrentPlayer(), null, new ArrayList<>());

        } else {
            throw new IllegalStateException("Cannot start game from current state: " + state);
        }

    }

    /**
     * Ends the game if the room is in the {@code PLAYING} state.
     * Note: This method right now has no use because rooms are not saved in the database, therefore, we don't need to have {@code RoomState.FINISHED} rooms. A delete is enough.
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
     */
    public void nextPlayer() {
        if (!players.isEmpty()) {
            currentPlayerIndex = (currentPlayerIndex + 1) % players.size();
        }

    }

    /**
     * Returns the next player in the list, not advancing to it.

     * @return the next player, or null if no players are available
     */
    public Player peekNextPlayer() {
        if (players.isEmpty()) return null;
        int nextIndex = (currentPlayerIndex + 1) % players.size();
        return players.get(nextIndex);
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
     * Starts the next turn by processing the challenge and updating the current turn.
     *
     * @param challenge the challenge to process
        * @param advance whether to advance to the next player
     *
     * @return true if the turn was successfully started, false if the sex of the player is incompatible with the challenge
     */
    public boolean nextTurn(Challenge challenge, boolean advance) {
        if (advance) nextPlayer();
        try {
            this.currentTurn = processChallenge(challenge);
            this.roundNumber++;
            this.usedUUIDS.add(this.currentTurn.getChallenge().getId());
            return true;
        } catch (IncompatibleSexException e) {
            return false;
        }

    }

    /**
     * Processes a challenge by replacing placeholders with player names.
     *
     * @param challenge the challenge to process
     * Note: Currently only replaces {Player} and {Player2} placeholders. Only 2 players are supported for now.
     * @return the processed challenge with player names replaced and sips added
     * @throws IncompatibleSexException if the challenge is incompatible with the player's sex
     */

    private PlayerTurn processChallenge(Challenge challenge) throws IncompatibleSexException {

        String text = challenge.getText();
        Penalty newPenalty = null;

        //Sex needs to be either the player sex or All
        ArrayList<Player> affectedPlayers = new ArrayList<>();
         if (challenge.getPlayers() == 1) {
                affectedPlayers.add(getCurrentPlayer());
             Sex challengeSex = challenge.getSexes().getFirst();
             if (challengeSex != Sex.ALL && currentTurn.getPlayer().getSex() != challengeSex) {
                    throw new IncompatibleSexException();
             }

            text = text.replace("{Player}", getCurrentPlayer().getName());
         } else if (challenge.getPlayers() == 2) {
             Sex challengeSex = challenge.getSexes().getFirst();
             Sex secondChallengeSex = challenge.getSexes().get(1);
            Player player2 = this.getRandomPlayer(List.of(getCurrentPlayer()));
            affectedPlayers.add(getCurrentPlayer());
            affectedPlayers.add(player2);

            if ((challengeSex != Sex.ALL && getCurrentPlayer().getSex() != challengeSex) ||
                    (secondChallengeSex != Sex.ALL && player2.getSex() != secondChallengeSex)) {
                throw new IncompatibleSexException();
            }

            text = text.replace("{Player}", getCurrentPlayer().getName());
            text = text.replace("{Player2}", player2.getName());

            if (challenge.getPenalty() != null) {
                String penaltyText = challenge.getPenalty().getText();
                if (penaltyText.contains("{Player}")) {
                    penaltyText = penaltyText.replace("{Player}", getCurrentPlayer().getName());
                }
                if (penaltyText.contains("{Player2}")) {
                    penaltyText = penaltyText.replace("{Player2}", player2.getName());
                }
                newPenalty = new Penalty();
                newPenalty.setRounds(challenge.getPenalty().getRounds());
                newPenalty.setText(penaltyText);
            }
         }

         text = text.replace("{sips}", String.valueOf(challenge.getSips()));


        Challenge processedChallenge = new Challenge();
        processedChallenge.setId(challenge.getId());
        processedChallenge.setText(text);
        processedChallenge.setDifficulty(challenge.getDifficulty());
        processedChallenge.setSips(challenge.getSips());
        processedChallenge.setType(challenge.getType());
        processedChallenge.setPenalty(newPenalty);


        return new PlayerTurn(currentTurn.getPlayer(), processedChallenge, affectedPlayers);
    }

    /**
     * Handles the completion of a challenge.
     *
     * @param drunk if the player drunk the challenge
     */
    public void handleChallengeCompletion(boolean drunk) {

        Player player = currentTurn.getPlayer();

        if (drunk) { //player drunk
            int sips = currentTurn.getChallenge().getSips();
            player.addSips(sips);

        } else { //player completed the challenge
            //check if the challenge has penalty associated
            if (currentTurn.getChallenge().getPenalty() != null) {
                //apply penalty to all affected players
                for (Player p : currentTurn.getAffectedPlayers()) {
                    p.addPenalty(currentTurn.getChallenge().getPenalty());
                }
            }

        }

        //decrement the penalty rounds for all players
        for (Player p : currentTurn.getAffectedPlayers()) {
            p.processPenalties();
        }

    }

    public void handlePenalties() {
        for (Player p : players) {
            p.processPenalties();
        }
    }
}
