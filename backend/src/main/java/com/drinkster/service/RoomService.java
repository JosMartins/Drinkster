package com.drinkster.service;

import com.drinkster.model.DifficultyValues;
import com.drinkster.model.GameRoom;
import com.drinkster.model.Player;
import com.drinkster.model.enums.RoomMode;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RoomService {


    private final Map<UUID, GameRoom> gameRooms = new ConcurrentHashMap<>();

    public List<GameRoom> getRooms() {
        return new ArrayList<>(gameRooms.values());
    }

    public GameRoom getRoom(UUID roomId) {
        return gameRooms.get(roomId);
    }

    public GameRoom createRoom(String roomName, boolean isPrivate, String password, Player admin, RoomMode mode, int rememberedChallenges, boolean showChallenges) {
        GameRoom gameRoom = new GameRoom(roomName, isPrivate, password, admin, mode, rememberedChallenges, showChallenges);
        gameRooms.put(gameRoom.getId(), gameRoom);
        return gameRoom;
    }

    public void deleteRoom(UUID roomId) throws IllegalArgumentException {
        if (!gameRooms.containsKey(roomId)) {
            throw new IllegalArgumentException("Room does not exist");
        }

        gameRooms.remove(roomId);
    }

    /**
     * Join a game room.
     *
     * @param roomId The ID of the room.
     * @param player The player who is joining the room.
     *
     * @throws IllegalArgumentException if the room does not exist or the player is already in the room.
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
     * Leave a game room.
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
     * @param adminId The ID of the admin who is kicking the player.
     */
    public void kickPlayer(UUID roomId, UUID playerID, UUID adminId) {
        GameRoom gameRoom = gameRooms.get(roomId);


        if (gameRoom == null) {
            throw new IllegalArgumentException("Room does not exist");
        }


        if (!gameRoom.getAdmin().getId().equals(adminId)) {
            throw new IllegalArgumentException("Only the admin can kick players");
        }

        Player player = gameRoom.getPlayer(playerID);

        if (player == null) {
            throw new IllegalArgumentException("Player not found in the room");
        }

        gameRoom.removePlayer(player);
    }

    /**
     * Change the difficulty of a player in the game room.
     *
     * @param roomId The ID of the room.
     * @param playerId The ID of the player whose difficulty is to be changed.
     * @param difficulty The new difficulty values for the player.
     * @param adminId The ID of the admin who is changing the difficulty.
     */
    public void changePlayerDifficulty(UUID roomId, UUID playerId, DifficultyValues difficulty, UUID adminId) {
        GameRoom gameRoom = gameRooms.get(roomId);
        if (gameRoom == null) {
            throw new IllegalArgumentException("Room does not exist");
        }

        if (!gameRoom.getAdmin().getId().equals(adminId)) {
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
    }

    /**
     * Change the challenge mode of the game room.
     *
     * @param roomId The ID of the room.
     * @param mode The new challenge mode (show challenges to other players or no).
     * @param adminId The ID of the admin who is changing the mode.
     */
    public void changeChallengeMode(UUID roomId, boolean mode, UUID adminId) {
        GameRoom gameRoom = gameRooms.get(roomId);
        if (gameRoom == null) {
            throw new IllegalArgumentException("Room does not exist");
        }

        if (!gameRoom.getAdmin().getId().equals(adminId)) {
            throw new IllegalArgumentException("Only the admin can change challenge mode");
        }

        gameRoom.setShowChallenges(mode);
    }

}
