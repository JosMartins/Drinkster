package com.drinkster.controller;

import com.drinkster.dto.DifficultyDto;
import com.drinkster.dto.RoomListItemDto;
import com.drinkster.dto.response.*;
import com.drinkster.dto.request.CreateRoomRequest;
import com.drinkster.model.GameRoom;
import com.drinkster.model.Player;
import com.drinkster.model.enums.RoomMode;
import com.drinkster.model.enums.Sex;
import com.drinkster.service.RoomService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
public class RoomWebSocketController {

    private final RoomService roomService;

    public RoomWebSocketController(RoomService roomService) {
        this.roomService = roomService;
    }

    /**
     * Handles the request to get the list of rooms.
     *
     * @return a list of rooms.
     */
    @MessageMapping("/list-rooms")
    @SendTo("/topic/rooms-list")
    public RoomListResponse listRooms() {
        return new RoomListResponse(
                roomService.getRooms().stream()
                        .map(RoomListItemDto::fromGameRoom)
                        .toList()
        );

    }


    @MessageMapping("/create-room")
    @SendTo("/topic/room-created")
    public RoomCreatedResponse handleCreateRoom(CreateRoomRequest request, SimpMessageHeaderAccessor headerAccessor) {

        String sessionId = headerAccessor.getSessionId();

        Player admin = new Player(
                request.player().name(),
                Sex.fromDbCode(request.player().sex()),
                request.player().difficulty_values(),
                true,
                sessionId
        );

        GameRoom room = roomService.createRoom(
                request.name(),
                request.isPrivate(),
                request.password(),
                admin,
                RoomMode.valueOf(request.mode().toUpperCase()),
                request.rememberCount(),
                request.showChallenges());

        return new RoomCreatedResponse(room.getId().toString(), admin.getId().toString());
    }


    @MessageMapping("/join-room")
    @SendTo("/topic/{roomId}/player-joined")
    public BaseResponse handleJoinRoom(String roomId,
                                       CreateRoomRequest.PlayerConfig playerConfig,
                                       SimpMessageHeaderAccessor headerAccessor) {

        String sessionId = headerAccessor.getSessionId();
        Player joiner = new Player(
                playerConfig.name(),
                Sex.valueOf(playerConfig.sex()),
                playerConfig.difficulty_values(),
                false,
                sessionId
        );

        try {
            UUID roomUUID = UUID.fromString(roomId);
            roomService.joinRoom(roomUUID, joiner);

            return new JoinResponse(
                    "Joined room successfully",
                    joiner.getId().toString()
            );
        } catch (IllegalArgumentException e) {
            return new ErrorResponse(
                    "400", // Bad Request
                    e.getMessage()
            );
        }


    }

    @MessageMapping("/leave-room")
    @SendTo("/topic/{roomId}/player-left")
    public BaseResponse handleLeaveRoom(String roomId, String playerId,
                                        SimpMessageHeaderAccessor headerAccessor) {
        try {
            UUID roomUUID = UUID.fromString(roomId);
            UUID playerUUID = UUID.fromString(playerId);
            roomService.leaveRoom(roomUUID, playerUUID, headerAccessor.getSessionId());

            return new JoinResponse("Left room successfully", playerId);
        } catch (IllegalArgumentException e) {
            return new ErrorResponse(
                    "400", // Bad Request
                    e.getMessage()
            );
        }
    }

    @MessageMapping("/player-ready")
    @SendTo("/topic/{roomId}/player-status-update")
    public BaseResponse playerReady(String roomId, String playerId,
                                    SimpMessageHeaderAccessor headerAccessor){
        try {
            UUID roomUUID = UUID.fromString(roomId);
            UUID playerUUID = UUID.fromString(playerId);
            roomService.playerReady(roomUUID, playerUUID, headerAccessor.getSessionId());

            return new PlayerStatusResponse(roomId, playerId, true);
        } catch (IllegalArgumentException e) {
            return new ErrorResponse(
                    "400", // Bad Request
                    e.getMessage()
            );
        }

    }

    @MessageMapping("/player-unready")
    @SendTo("/topic/{roomId}/player-status-update")
    public BaseResponse playerUnready(String roomId, String playerId,
                                    SimpMessageHeaderAccessor headerAccessor){
        try {
            UUID roomUUID = UUID.fromString(roomId);
            UUID playerUUID = UUID.fromString(playerId);
            roomService.playerUnready(roomUUID, playerUUID, headerAccessor.getSessionId());

            return new PlayerStatusResponse(roomId, playerId, false);
        } catch (IllegalArgumentException e) {
            return new ErrorResponse(
                    "400", // Bad Request
                    e.getMessage()
            );
        }

    }

    @MessageMapping("/kick-player")
    @SendTo("/topic/{roomId}/player-left")
    public BaseResponse handleAdminKickPlayer(String roomId, String playerId,
                                              SimpMessageHeaderAccessor headerAccessor) {
        try {
            UUID roomUUID = UUID.fromString(roomId);
            UUID playerUUID = UUID.fromString(playerId);
            roomService.kickPlayer(roomUUID, playerUUID, headerAccessor.getSessionId());

            return new JoinResponse("Player kicked successfully", playerId);
        } catch (IllegalArgumentException e) {
            return new ErrorResponse(
                    "400", // Bad Request
                    e.getMessage()
            );
        }
    }

    @MessageMapping("/get-player-difficulty")
    @SendTo("/topic/{roomId}/{playerId}/difficulty")
    public BaseResponse handleGetPlayerDifficulty(String roomId, String playerId,
                                                  SimpMessageHeaderAccessor headerAccessor) {
        try {
            UUID roomUUID = UUID.fromString(roomId);
            UUID playerUUID = UUID.fromString(playerId);

            DifficultyDto diff = roomService.getPlayerDifficulty(roomUUID, playerUUID, headerAccessor.getSessionId());
            return new GetPlayerDifficultyResponse(diff);
        } catch (IllegalArgumentException e) {
            return new ErrorResponse(
                    "400", // Bad Request
                    e.getMessage()
            );
        }
    }

    @MessageMapping("/change-difficulty")
    @SendTo("/topic/{roomId}/{playerId}/difficulty-changed")
    public BaseResponse handleChangeDifficulty(String roomId, String playerId,
                                               CreateRoomRequest.PlayerConfig playerConfig,
                                               SimpMessageHeaderAccessor headerAccessor) {
        try {
            UUID roomUUID = UUID.fromString(roomId);
            UUID playerUUID = UUID.fromString(playerId);
            roomService.changePlayerDifficulty(roomUUID, playerUUID, playerConfig.difficulty_values(), headerAccessor.getSessionId());

            return new JoinResponse("Player difficulty changed successfully", playerId);
        } catch (IllegalArgumentException e) {
            return new ErrorResponse(
                    "400", // Bad Request
                    e.getMessage()
            );
        }
    }

    @MessageMapping("/start-game")
    @SendTo("/topic/{roomId}/game-started")
    public BaseResponse handleStartGame(String roomId,
                                        SimpMessageHeaderAccessor headerAccessor) {
        try {
            UUID roomUUID = UUID.fromString(roomId);
            roomService.startGame(roomUUID, headerAccessor.getSessionId());

            return new StartGameResponse();
        } catch (IllegalArgumentException e) {
            return new ErrorResponse(
                    "400", // Bad Request
                    e.getMessage()
            );
        }
    }

    /// SESSION RESTORE ///


    @MessageMapping("/restore-session")
    @SendTo("/topic/{playerId}/session-restored")
    public BaseResponse restoreSession(String roomId, String playerId, SimpMessageHeaderAccessor headerAccessor) {
        UUID roomUUID = UUID.fromString(roomId);
        UUID playerUUID = UUID.fromString(playerId);

        try {
            return roomService.restoreSession(roomUUID, playerUUID, headerAccessor.getSessionId());
        } catch (IllegalArgumentException e) {
            return new ErrorResponse(
                    "400", // Bad Request
                    e.getMessage()
            );
        }
    }
}
