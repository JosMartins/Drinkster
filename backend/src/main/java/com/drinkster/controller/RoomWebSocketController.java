package com.drinkster.controller;

import com.drinkster.dto.DifficultyDto;
import com.drinkster.dto.GameRoomDto;
import com.drinkster.dto.PlayerDto;
import com.drinkster.dto.RoomListItemDto;
import com.drinkster.dto.request.*;
import com.drinkster.dto.response.*;
import com.drinkster.model.DifficultyValues;
import com.drinkster.model.GameRoom;
import com.drinkster.model.Player;
import com.drinkster.model.enums.Sex;
import com.drinkster.service.RoomService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
public class RoomWebSocketController {

    private final RoomService roomService;
    private final SimpMessagingTemplate messagingTemplate;

    public RoomWebSocketController(RoomService roomService, SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
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

    @MessageMapping("/get-room")
    public void getRoom(String roomId,
                        SimpMessageHeaderAccessor headerAccessor) {
        try {
            UUID roomUUID = UUID.fromString(roomId);

            this.messagingTemplate.convertAndSend(
                    "/topic/" + roomId + "/room-info",
                    GameRoomDto.fromGameRoom(roomService.getRoom(roomUUID))
            );
        } catch (IllegalArgumentException e) {
            this.messagingTemplate.convertAndSend(
                    "/topic/" + roomId + "/error",
                    new ErrorResponse(
                            "400", // Bad Request
                            e.getMessage()
                    )
            );
        }
    }

    @MessageMapping("/create-room")
    public void handleCreateRoom(CreateRoomRequest request,
                                                SimpMessageHeaderAccessor headerAccessor) {

        String sessionId = headerAccessor.getSessionId();

        try {

            Player admin = new Player(
                request.player().name(),
                Sex.fromDbCode(request.player().sex()),
                request.player().difficulty_values(),
                true,
                sessionId);

            GameRoom room = roomService.createRoom(
                    request.name(),
                    request.isPrivate(),
                    request.password(),
                    admin,
                    request.mode().toUpperCase(),
                    request.rememberCount(),
                    request.showChallenges());


             messagingTemplate.convertAndSend("/topic/room-created", new RoomCreatedResponse(room.getId().toString(), admin.getId().toString()));
        } catch (IllegalArgumentException e) {
            messagingTemplate.convertAndSend("/topic/room-error", new ErrorResponse("400", e.getMessage()));
        } catch (NullPointerException e) {
            messagingTemplate.convertAndSend("/topic/room-error", new ErrorResponse("400", "Missing required parameters"));
        }



    }


    @MessageMapping("/join-room")
    public void handleJoinRoom(JoinRequest request,
                               SimpMessageHeaderAccessor headerAccessor) {

        String sessionId = headerAccessor.getSessionId();
        Player joiner = new Player(
                request.playerConfig().name(),
                Sex.fromDbCode(request.playerConfig().sex()),
                request.playerConfig().difficulty_values(),
                false,
                sessionId
        );

        try {

            UUID roomUUID = UUID.fromString(request.roomId());
            roomService.joinRoom(roomUUID, joiner);

            this.messagingTemplate.convertAndSend(
                    "/topic/" + request.roomId() + "/player-joined",
                    PlayerDto.fromPlayer(joiner)
            );

        } catch (IllegalArgumentException e) {

            this.messagingTemplate.convertAndSend(
                    "/topic/" + request.roomId() + "/error",
                    new ErrorResponse(
                            "400", // Bad Request
                            e.getMessage()
                    )
            );
        }
    }

    @MessageMapping("/leave-room")
    public void handleLeaveRoom(LeaveRequest request,
                                SimpMessageHeaderAccessor headerAccessor) {
        try {
            UUID roomUUID = UUID.fromString(request.roomId());
            UUID playerUUID = UUID.fromString(request.playerId());
            roomService.leaveRoom(roomUUID, playerUUID, headerAccessor.getSessionId());

            this.messagingTemplate.convertAndSend("/topic/" + request.roomId() + "/player-left",
                    request.playerId()
            );
        } catch (IllegalArgumentException e) {
            this.messagingTemplate.convertAndSend(
                    "/topic/" + request.roomId() + "/error",
                    new ErrorResponse(
                            "400", // Bad Request
                            e.getMessage()
                    )
            );
        }
    }

    @MessageMapping("/player-ready")
    public void playerReady(PlayerStatusUpdateRequest request,
                                    SimpMessageHeaderAccessor headerAccessor){
        try {
            UUID roomUUID = UUID.fromString(request.roomId());
            UUID playerUUID = UUID.fromString(request.playerId());
            roomService.playerReady(roomUUID, playerUUID, headerAccessor.getSessionId());

            this.messagingTemplate.convertAndSend(
                    "/topic/" + request.roomId() + "/player-status-update",
                    new PlayerStatusResponse(request.playerId(), true)
            );
        } catch (IllegalArgumentException e) {
            this.messagingTemplate.convertAndSend(
                    "/topic/" + request.roomId() + "/error",
                    new ErrorResponse(
                            "400", // Bad Request
                            e.getMessage()
                    )
            );
        }

    }

    @MessageMapping("/player-unready")
    public void playerUnready(PlayerStatusUpdateRequest request,
                                    SimpMessageHeaderAccessor headerAccessor){
        try {
            UUID roomUUID = UUID.fromString(request.roomId());
            UUID playerUUID = UUID.fromString(request.playerId());
            roomService.playerUnready(roomUUID, playerUUID, headerAccessor.getSessionId());

            this.messagingTemplate.convertAndSend(
                    "/topic/" + request.roomId() + "/player-status-update",
                    new PlayerStatusResponse(request.playerId(), false)
            );
        } catch (IllegalArgumentException e) {
            this.messagingTemplate.convertAndSend(
                    "/topic/" + request.roomId() + "/error",
                    new ErrorResponse(
                            "400", // Bad Request
                            e.getMessage()
                    )
            );
        }

    }

    @MessageMapping("/kick-player")
    public void handleAdminKickPlayer(LeaveRequest request,
                                              SimpMessageHeaderAccessor headerAccessor) {
        try {
            UUID roomUUID = UUID.fromString(request.roomId());
            UUID playerUUID = UUID.fromString(request.playerId());
            roomService.kickPlayer(roomUUID, playerUUID, headerAccessor.getSessionId());

            this.messagingTemplate.convertAndSend(
                    "/topic/" + request.roomId() + "/player-left",
                    request.playerId()
            );
        } catch (IllegalArgumentException e) {
            this.messagingTemplate.convertAndSend(
                    "/topic/" + request.roomId() + "/error",
                    new ErrorResponse(
                            "400", // Bad Request
                            e.getMessage()
                    )
            );
        }
    }
    //TODO: change this method. admin should receive the difficulty, not the player with the id
    @MessageMapping("/get-player-difficulty")
    public void handleGetPlayerDifficulty(PlayerDifficultyRequest request,
                                          SimpMessageHeaderAccessor headerAccessor) {
        try {
            UUID roomUUID = UUID.fromString(request.roomId());
            UUID playerUUID = UUID.fromString(request.playerId());

            DifficultyDto diff = roomService.getPlayerDifficulty(roomUUID, playerUUID, headerAccessor.getSessionId());
            this.messagingTemplate.convertAndSend(
                    "/topic/" + request.playerId() + "/difficulty-changed",
                    diff
            );
        } catch (IllegalArgumentException e) {
            this.messagingTemplate.convertAndSend(
                    "/topic/" + request.roomId() + "/error",
                    new ErrorResponse(
                            "400", // Bad Request
                            e.getMessage()
                    )
            );
        }
    }

    @MessageMapping("/change-difficulty")
    public void handleChangeDifficulty(PlayerDifficultyRequest request,
                                               CreateRoomRequest.PlayerConfig playerConfig,
                                               SimpMessageHeaderAccessor headerAccessor) {
        try {
            UUID roomUUID = UUID.fromString(request.roomId());
            UUID playerUUID = UUID.fromString(request.playerId());
            DifficultyValues newDiff =  roomService.changePlayerDifficulty(roomUUID, playerUUID, playerConfig.difficulty_values(), headerAccessor.getSessionId());

            this.messagingTemplate.convertAndSend(
                    "/topic/" + request.roomId() + "/difficulty-changed",
                    DifficultyDto.fromDifficultyValues(newDiff)
            );
        } catch (IllegalArgumentException e) {
            this.messagingTemplate.convertAndSend(
                    "/topic/" + request.roomId() + "/error",
                    new ErrorResponse(
                            "400", // Bad Request
                            e.getMessage()
                    )
            );
        }
    }


    /// SESSION RESTORE ///


    @MessageMapping("/restore-session")
    public void restoreSession(SessionRestoreRequest request, SimpMessageHeaderAccessor headerAccessor) {

        try {

            UUID roomUUID = UUID.fromString(request.roomId());
            UUID playerUUID = UUID.fromString(request.playerId());
            SessionRestoreResponse resp = roomService.restoreSession(roomUUID, playerUUID, headerAccessor.getSessionId());
            this.messagingTemplate.convertAndSend(
                    "/topic/" + request.playerId() + "/session-restored",
                    resp);
        } catch (IllegalArgumentException | NullPointerException e) {
            this.messagingTemplate.convertAndSend(
                    "/topic/" + request.playerId() + "/session-not-found",
                    new ErrorResponse(
                            "404", // Bad Request
                            "Session not found"
                    )
            );
        }
    }
}
