package com.drinkster.model;

import com.drinkster.model.enums.Difficulty;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.socket.WebSocketSession;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class Game {
    private static final int SISP_PER_GLASS = 4;

    // Communication
    private WebSocketSession webSocketSession;
    private List<Player> players;
    private String roomId;
    private boolean showChallenges;

    // Game state
    private PlayerTurn currentTurn;
    private GameStats stats;
    private int currentPlayerIndex;
    private int currentRound;
    private Player secondPlayer;
    private int rememberedChallenges;
    private String mode; // "normal" or "random"

    // Challenge tracking
    private ChallengeStats challengeStats;

    public Game(List<Player> players, int rememberedChallenges, String mode, String roomId, boolean showChallenges) {
        this.players = players;
        this.roomId = roomId;
        this.mode = mode;
        this.rememberedChallenges = rememberedChallenges;
        this.showChallenges = showChallenges;

        this.currentPlayerIndex = 0;
        this.currentRound = 1;
        this.stats = new GameStats();

        // Initialize challenge stats with defaults
        this.challengeStats = new ChallengeStats();
        this.currentTurn = createNewTurn();
    }

    private PlayerTurn createNewTurn() {
        if (players.isEmpty()) {
            return new PlayerTurn();
        }
        Player currentPlayer = players.get(currentPlayerIndex);
        return new PlayerTurn(currentPlayer.getId().toString(), currentPlayer.getName(), null);
    }

    public Player getCurrentPlayer() {
        if (players.isEmpty()) return null;
        return players.get(currentPlayerIndex);
    }

    public void nextTurn() {

        // TODO: Implement challenge fetching logic
        this.currentTurn = createNewTurn();
    }

    public void handleCompletedChallenge(boolean success) {


        /*TODO: Implement logic to handle the completion of a challenge.
         * Check if player succeeded or drunk the challenge.
         * process penalties, i.e. remove one round from each penalty.
         * */

        /*TODO: implement glass almost empty chance:
         * CHECK THIS FOR ALL PLAYERS (some challenges are to give sips, so the drinker might not be the current player
         * Find out a way to decouple this from this function, so that the popup can appear at any time rather then only when the game changes turn
         * if the player's sips % SIPS_PER_GLASS == 0, then the player has a chance to have its glass almost empty.
         * this will add a 30% chance for a game_event -> send to player (popup): ("Your glass is almost empty. Drink the rest of it and refill!") something like that
         * */
    }
}