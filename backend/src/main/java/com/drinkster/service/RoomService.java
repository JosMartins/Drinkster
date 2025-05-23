package com.drinkster.service;

import com.drinkster.dto.*;
import com.drinkster.dto.response.SessionRestoreResponse;
import com.drinkster.model.*;
import com.drinkster.model.enums.Difficulty;
import com.drinkster.model.enums.RoomMode;
import com.drinkster.model.enums.RoomState;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;


@Service
public class RoomService {


    private final Map<UUID, GameRoom> gameRooms = new ConcurrentHashMap<>();
    private final ChallengeService challengeService;


    public RoomService(ChallengeService challengeService) {
        this.challengeService = challengeService;
    }

    /// ROOM MANAGEMENT ///

    /**
     * Get a list of all game rooms.
     *
     * @return A list of game rooms.
     */
    public List<GameRoom> getRooms() {
        return new ArrayList<>(gameRooms.values());
    }

    /**
     * Get a game room by its ID.
     *
     * @param roomId The ID of the room.
     * @return The game room with the specified ID, or null if not found.
     */
    public GameRoom getRoom(UUID roomId) {
        return gameRooms.get(roomId);
    }

    /**
     * Create a new game room.
     *
     * @param roomName The name of the room.
     * @param isPrivate Whether the room is private or not.
     * @param password The password for the room (if private).
     * @param admin The admin player of the room.
     * @param mode The mode of the room (e.g., public, private).
     * @param rememberedChallenges The number of challenges to remember.
     * @param showChallenges Whether to show challenges to other players or not.
     *
     * @return The created game room.
     */
    public GameRoom createRoom(String roomName, boolean isPrivate, String password, Player admin, String mode, int rememberedChallenges, boolean showChallenges) throws IllegalArgumentException {

        if (roomName == null || roomName.isEmpty()) {
            throw new IllegalArgumentException("Room name cannot be null or empty");
        }

        if (isPrivate && (password == null || password.isEmpty())) {
            throw new IllegalArgumentException("Password cannot be null or empty for private rooms");
        }

        if (admin == null) {
            throw new IllegalArgumentException("Admin cannot be null");
        }


        if (rememberedChallenges <= 0) {
            throw new IllegalArgumentException("Remembered challenges must be greater than 0");
        }


        GameRoom gameRoom = new GameRoom(roomName, isPrivate, password, admin, RoomMode.valueOf(mode), rememberedChallenges, showChallenges);
        gameRooms.put(gameRoom.getId(), gameRoom);
        return gameRoom;
    }

    /// PLAYER MANAGEMENT ///

    /**
     * Join a game room.
     *
     * @param roomId The ID of the room.
     * @param player The player who is joining the room.
     *
     * @throws IllegalArgumentException if the room does not exist, or the player is already in the room.
     */
    public void joinRoom(UUID roomId, Player player) throws IllegalArgumentException {
        GameRoom gameRoom = gameRooms.get(roomId);

        if (gameRoom == null) {
            throw new IllegalArgumentException("Room does not exist");
        }

        if (player == null || player.equals(gameRoom.getAdmin())) {
            throw new IllegalArgumentException("Player cannot be null or the same as the admin");
        }
            gameRoom.addPlayer(player);

    }

    /**
     * Leave the game room.
     *
     * @param roomId The ID of the room.
     * @param playerID The player who is leaving the room.
     * @param sockId The socket ID of the player.
     *
     * @throws IllegalArgumentException if the room does not exist or the player is not in the room or the socketId does not correspond to the player.
     */
    public void leaveRoom(UUID roomId, UUID playerID, String sockId) throws IllegalArgumentException {

        GameRoom gameRoom = gameRooms.get(roomId);
        if (gameRoom == null) {
            throw new IllegalArgumentException("Room does not exist");
        }

        Player roomPlayer = gameRoom.getPlayer(playerID);

        if (roomPlayer == null) {
            throw new IllegalArgumentException("Player not found in the room");
        }

        if (sockId == null) {
            throw new IllegalArgumentException("Socket ID is null");
        }
        if (roomPlayer.getSocketId() == null) {
            throw new IllegalArgumentException("Player socket ID is null");
        }

        if (!roomPlayer.getSocketId().equals(sockId)) {
            throw new IllegalArgumentException("Request Identifier does not match the player");
        }

        if (gameRoom.getAdmin().getId().equals(roomPlayer.getId())) {
            // If the admin leaves, we need to assign a new admin or delete the room
            if (gameRoom.getPlayers().size() > 1) {
                // Assign the first player as the new admin
                Player newAdmin = gameRoom.getPlayers().get(1);
                gameRoom.setAdmin(newAdmin);
            } else {
                // If no players left, delete the room
                gameRooms.remove(roomId);
                return;
            }
        }

        gameRoom.removePlayer(roomPlayer);
    }

    /**
     *  Kick a player from the game room.
     *
     * @param roomId The ID of the room.
     * @param playerID The ID of the player to be kicked.
     * @param adminSockId The ID of the admin who is kicking the player.
     */
    public void kickPlayer(UUID roomId, UUID playerID, String adminSockId) {

        if (roomId == null || playerID == null || adminSockId == null) {
            throw new IllegalArgumentException("Room ID, Player ID, and Admin Socket ID cannot be null");
        }

        GameRoom gameRoom = gameRooms.get(roomId);

        if (gameRoom == null) {
            throw new IllegalArgumentException("Room does not exist");
        }


        if (!gameRoom.getAdmin().getSocketId().equals(adminSockId)) {
            throw new IllegalArgumentException("Only the admin can kick players");
        }

        Player player = gameRoom.getPlayer(playerID);

        if (player == null) {
            throw new IllegalArgumentException("Player not found in the room");
        }

        gameRoom.removePlayer(player);
    }

    /**
     * Set the player as ready in the game room.
     *
     * @param roomId The ID of the room.
     * @param playerId The ID of the player who is ready.
     * @param sockId The socket ID of the player.
     *
     * @throws IllegalArgumentException if the room does not exist or the player is not in the room or the socketId does not correspond to the player.
     */
    public void playerReady(UUID roomId, UUID playerId, String sockId) throws IllegalArgumentException {
        GameRoom gameRoom = gameRooms.get(roomId);
        if (gameRoom == null) {
            throw new IllegalArgumentException("Room does not exist");
        }

        Player roomPlayer = gameRoom.getPlayer(playerId);

        if (roomPlayer == null) {
            throw new IllegalArgumentException("Player not found in the room");
        }

        if (sockId == null) {
            throw new IllegalArgumentException("Socket ID is null");
        }
        if (roomPlayer.getSocketId() == null) {
            throw new IllegalArgumentException("Player socket ID is null");
        }

        if (!roomPlayer.getSocketId().equals(sockId)) {
            throw new IllegalArgumentException("Request Identifier does not match the player");
        }

        roomPlayer.setReady(true);
    }

    /**
     * Set the player as unready in the game room.
     *
     * @param roomId The ID of the room.
     * @param playerId The ID of the player who is unready.
     * @param sockId The socket ID of the player.
     *
     * @throws IllegalArgumentException if the room does not exist or the player is not in the room or the socketId does not correspond to the player.
     */
    public void playerUnready(UUID roomId, UUID playerId, String sockId) throws IllegalArgumentException {
        GameRoom gameRoom = gameRooms.get(roomId);
        if (gameRoom == null) {
            throw new IllegalArgumentException("Room does not exist");
        }

        Player roomPlayer = gameRoom.getPlayer(playerId);

        if (roomPlayer == null) {
            throw new IllegalArgumentException("Player not found in the room");
        }

        if (sockId == null) {
            throw new IllegalArgumentException("Socket ID is null");
        }
        if (roomPlayer.getSocketId() == null) {
            throw new IllegalArgumentException("Player socket ID is null");
        }

        if (!roomPlayer.getSocketId().equals(sockId)) {
            throw new IllegalArgumentException("Request Identifier does not match the player");
        }

        roomPlayer.setReady(false);
    }

    /**
     * Get the difficulty of a player in the game room.
     *
     * @param roomId The ID of the room.
     * @param playerId The ID of the player whose difficulty is to be retrieved.
     *
     * @return The difficulty values for the player.
     */
    public DifficultyDto getPlayerDifficulty(UUID roomId, UUID playerId, String adminSockId) throws IllegalArgumentException {
        GameRoom gameRoom = gameRooms.get(roomId);
        if (gameRoom == null) {
            throw new IllegalArgumentException("Room does not exist");
        }

        Player player = gameRoom.getPlayer(playerId);
        if (player == null) {
            throw new IllegalArgumentException("Player not found in the room");
        }

        if (!gameRoom.getAdmin().getSocketId().equals(adminSockId)) {
            throw new IllegalArgumentException("Only the admin can get player difficulty");
        }

        DifficultyValues difficultyValues = player.getDifficultyValues();
        return new DifficultyDto(difficultyValues.getEasy(), difficultyValues.getMedium(), difficultyValues.getHard(), difficultyValues.getExtreme());
    }

    /**
     * Change the difficulty of a player in the game room.
     *
     * @param roomId The ID of the room.
     * @param playerId The ID of the player whose difficulty is to be changed.
     * @param difficulty The new difficulty values for the player.
     * @param adminSocketId The ID of the admin who is changing the difficulty.
     */
    public DifficultyValues changePlayerDifficulty(UUID roomId, UUID playerId, DifficultyValues difficulty, String adminSocketId) {
        GameRoom gameRoom = gameRooms.get(roomId);
        if (gameRoom == null) {
            throw new IllegalArgumentException("Room does not exist");
        }

        if (!gameRoom.getAdmin().getSocketId().equals(adminSocketId)) {
            throw new IllegalArgumentException("Only the admin can change player difficulty");
        }

        Player player = gameRoom.getPlayer(playerId);
        if (player == null) {
            throw new IllegalArgumentException("Player not found in the room");
        }

        if (difficulty == null || difficulty.getEasy()  + difficulty.getMedium() + difficulty.getHard() + difficulty.getExtreme() != 1) {
            throw new IllegalArgumentException("Difficulty values cannot be null and must sum to 100 %");
        }

        player.setDifficultyValues(difficulty);
        return player.getDifficultyValues();
    }

    /**
     * Change the challenge mode of the game room.
     *
     * @param roomId The ID of the room.
     * @param mode The new challenge mode (show challenges to other players or no).
     * @param adminSocketId The ID of the admin who is changing the mode.
     */
    public void changeChallengeMode(UUID roomId, boolean mode, String adminSocketId) {
        GameRoom gameRoom = gameRooms.get(roomId);
        if (gameRoom == null) {
            throw new IllegalArgumentException("Room does not exist");
        }

        if (!gameRoom.getAdmin().getSocketId().equals(adminSocketId)) {
            throw new IllegalArgumentException("Only the admin can change challenge mode");
        }

        gameRoom.setShowChallenges(mode);
    }

    /// GAME MANAGEMENT ///

    /**
     * Start the game in the room.
     *
     * @param roomId The ID of the room.
     * @param adminSocketId The ID of the admin who is starting the game.
     */
    public void startGame(UUID roomId, String adminSocketId) {
        GameRoom gameRoom = gameRooms.get(roomId);
        if (gameRoom == null) {
            throw new IllegalArgumentException("Room does not exist");
        }

        if (!gameRoom.getAdmin().getSocketId().equals(adminSocketId)) {
            throw new IllegalArgumentException("Only the admin can start the game");
        }

        gameRoom.startGame();
    }

    /**
     * Complete a challenge for the current player.
     *
     * @param roomId The ID of the room.
     * @param playerId The ID of the player who completed the challenge.
     * @param sockId The socket ID of the player.
     * @param drunk Whether the player is drunk or not.
     *
     * @throws IllegalArgumentException if the room does not exist or the player is not in the room or the socketId does not correspond to the player.
     */
    public void completeChallenge(UUID roomId, UUID playerId, String sockId, boolean drunk) throws IllegalArgumentException {
        GameRoom gameRoom = gameRooms.get(roomId);
        if (gameRoom == null) {
            throw new IllegalArgumentException("Room does not exist");
        }

        Player player = gameRoom.getPlayer(playerId);
        if (player == null) {
            throw new IllegalArgumentException("Player not found in the room");
        }

        if (sockId == null) {
            throw new IllegalArgumentException("Socket ID is null");
        }

        if (player.getSocketId() == null || !player.getSocketId().equals(sockId)) {
            throw new IllegalArgumentException("Request Identifier does not match the player");
        }

        if (gameRoom.getState() != RoomState.PLAYING) {
            throw new IllegalArgumentException("Game is not in progress");
        }

        if (!gameRoom.getCurrentPlayer().equals(player)) {
            throw new IllegalArgumentException("Player is not the current player");
        }

        if (!gameRoom.getCurrentTurn().allResponded()) {
            throw new IllegalArgumentException("Not all players have responded to the challenge");
        }

        gameRoom.handleChallengeCompletion(drunk);
    }

    /**
     * This methods checks if the condition to skip the challenge is met.
     *
     * @param roomId     The ID of the room.
     * @param adminSesId The session ID of the admin.
     * @implNote This will only be available for the admin.
     * @throws IllegalArgumentException if the room does not exist, the game is not in progress, or the admin session ID does not match.
     */
    public void forceSkipChallenge(String roomId, String adminSesId) throws IllegalArgumentException {
        GameRoom gameRoom = gameRooms.get(UUID.fromString(roomId));
        if (gameRoom == null) {
            throw new IllegalArgumentException("Room does not exist");
        }

        if (gameRoom.getState() != RoomState.PLAYING) {
            throw new IllegalArgumentException("Game is not in progress");
        }

        if (!gameRoom.getAdmin().getSocketId().equals(adminSesId)) {
            throw new IllegalArgumentException("Only the admin can force skip a challenge");
        }
    }



    /// SESSION RESTORATION ///

    /**
     * Restore the session for a player in the game room.
     *
     * @param roomUUID The UUID of the game room.
     * @param playerUUID The UUID of the player.
     * @param sessionId The session ID of the player.
     * @return The {@link SessionRestoreResponse} response containing the player and room information.
     */
    public SessionRestoreResponse restoreSession(UUID roomUUID, UUID playerUUID, String sessionId) {

        GameRoom gameRoom = gameRooms.get(roomUUID);
        if (gameRoom == null) {
            throw new IllegalArgumentException("Room does not exist");
        }

        Player player = gameRoom.getPlayer(playerUUID);
        if (player == null) {
            throw new IllegalArgumentException("Player not found in the room");
        }

        player.setSocketId(sessionId);

        PlayerDto self = PlayerDto.fromPlayer(player);
        GameRoomDto room = GameRoomDto.fromGameRoom(gameRoom);
        PlayerTurnDto currentTurn = null;
        PenaltyDto[] penalties = null;
        if (gameRoom.getState() == RoomState.PLAYING) {
            currentTurn = PlayerTurnDto.fromPlayerTurn(gameRoom.getCurrentTurn());
            penalties = player.getPenalties().stream()
                    .map(PenaltyDto::fromPenalty)
                    .toArray(PenaltyDto[]::new);
        }
        return new SessionRestoreResponse(self, room, penalties, currentTurn);
    }


    /// HELPERS ///

    /**
     * Starts the next turn in the game room.
     *
     * @param gameRoomUUID The game room.
     */
    public void startNextTurn(UUID gameRoomUUID) {
        GameRoom gameRoom = gameRooms.get(gameRoomUUID);

        if (gameRoom == null) {
            throw new IllegalArgumentException("Room does not exist");
        }
        // we peek first so we can use the player that the challenge is for
        Player nextPlayer = gameRoom.peekNextPlayer();
        Difficulty challengeDifficulty = challengeService.getRandomWeightedDifficulty(nextPlayer.getDifficultyValues());
        Challenge challenge = challengeService.getRandomChallenge(gameRoom.getUsedUUIDS().getQueueAsList(), challengeDifficulty);

        boolean isValid = gameRoom.nextTurn(challenge, true); // and then we advance the player

        while (!isValid) {
            // Get a new challenge
            challenge = challengeService.getRandomChallenge(gameRoom.getUsedUUIDS().getQueueAsList(), challengeDifficulty);
            isValid = gameRoom.nextTurn(challenge, false);
        }

    }

    public Player getAdmin(UUID roomUUID) {
        GameRoom gameRoom = gameRooms.get(roomUUID);
        if (gameRoom == null) {
            throw new IllegalArgumentException("Room does not exist");
        }
        return gameRoom.getAdmin();
    }
}

