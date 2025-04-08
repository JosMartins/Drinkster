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
        this.secondPlayer = null;
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.size();
        this.stats.incrementTotalRounds();

        // Process penalties
        for (Player player : players) {
            player.getPenalties().removeIf(penalty -> {
                if (penalty.getRounds() <= 0) return true;
                penalty.setRounds(penalty.getRounds() - 1);
                return false;
            });
        }

        // TODO: Implement challenge fetching logic
        this.currentTurn = createNewTurn();
    }
}