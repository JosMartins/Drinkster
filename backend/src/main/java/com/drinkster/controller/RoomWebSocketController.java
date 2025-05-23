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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Controller
public class RoomWebSocketController {

    private static final Logger logger = LoggerFactory.getLogger(RoomWebSocketController.class);
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");
    
    private final RoomService roomService;
    private final SimpMessagingTemplate messagingTemplate;

    public RoomWebSocketController(RoomService roomService, SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
        this.roomService = roomService;
        logger.info("{} - (initialized) [RoomWebSocketController]", getCurrentTime());
    }
    
    /**
     * Gets the current time formatted as a string
     * @return formatted current time
     */
    private String getCurrentTime() {
        return LocalDateTime.now().format(formatter);
    }

    /**
     * Handles the request to get the list of rooms.
     *
     * @return a list of rooms.
     */
    @MessageMapping("/list-rooms")
    @SendTo("/topic/rooms-list")
    public RoomListResponse listRooms(SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor != null ? headerAccessor.getSessionId() : "unknown";
        logger.info("{} {} - (requested) [listRooms]", getCurrentTime(), sessionId);
        
        RoomListResponse response = new RoomListResponse(
                roomService.getRooms().stream()
                        .map(RoomListItemDto::fromGameRoom)
                        .toList()
        );
        
        logger.info("{} {} - (response) [listRooms] returned {} rooms", 
                getCurrentTime(), sessionId, response.rooms().size());
        return response;
    }

    @MessageMapping("/get-room")
    public void getRoom(String roomId,
                        SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        logger.info("{} {} - (requested) [getRoom] roomId: {}", getCurrentTime(), sessionId, roomId);
        
        try {
            UUID roomUUID = UUID.fromString(roomId);
            GameRoom room = roomService.getRoom(roomUUID);
            
            this.messagingTemplate.convertAndSend(
                    "/topic/" + roomId + "/room-info",
                    GameRoomDto.fromGameRoom(room)
            );
            
            logger.info("{} {} - (response) [getRoom] sent room info for roomId: {}, players: {}", 
                    getCurrentTime(), sessionId, roomId, room.getPlayers().size());
        } catch (IllegalArgumentException e) {
            logger.error("{} {} - (error) [getRoom] invalid roomId: {} - {}", 
                    getCurrentTime(), sessionId, roomId, e.getMessage());
            
            this.messagingTemplate.convertAndSend(
                    "/topic/" + roomId + "/error",
                    new ErrorResponse(
                            "400", // Bad Request
                            e.getMessage()
                    )
            );
        } catch (NullPointerException e) {
            logger.error("{} {} - (error) [getRoom] room not found: {}", 
                    getCurrentTime(), sessionId, roomId);
            
            this.messagingTemplate.convertAndSend(
                    "/topic/" + roomId + "/error",
                    new ErrorResponse(
                            "404", // Not Found
                            "Room not found"
                    )
            );
        }
    }

    @MessageMapping("/create-room")
    public void handleCreateRoom(CreateRoomRequest request,
                                                SimpMessageHeaderAccessor headerAccessor) {

        String sessionId = headerAccessor.getSessionId();
        logger.info("{} {} - (requested) [createRoom] name: {}, mode: {}, private: {}, player: {}", 
                getCurrentTime(), sessionId, request.name(), request.mode(), request.isPrivate(), request.player().name());
    
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
    
            logger.info("{} {} - (response) [createRoom] room created with id: {}, admin player id: {}", 
                    getCurrentTime(), sessionId, room.getId(), admin.getId());
    
            messagingTemplate.convertAndSend("/topic/room-created", 
                    new RoomCreatedResponse(room.getId().toString(), admin.getId().toString()));
            this.listRooms(headerAccessor); // notify all clients about the new room
        } catch (IllegalArgumentException e) {
            logger.error("{} {} - (error) [createRoom] IllegalArgumentException: {}", 
                    getCurrentTime(), sessionId, e.getMessage());
            messagingTemplate.convertAndSend("/topic/room-error", new ErrorResponse("400", e.getMessage()));
        } catch (NullPointerException e) {
            logger.error("{} {} - (error) [createRoom] NullPointerException: {}", 
                    getCurrentTime(), sessionId, e.getMessage());
            messagingTemplate.convertAndSend("/topic/room-error", new ErrorResponse("400", "Missing required parameters"));
        }
    }


    @MessageMapping("/join-room")
    public void handleJoinRoom(JoinRequest request,
                               SimpMessageHeaderAccessor headerAccessor) {

        String sessionId = headerAccessor.getSessionId();
        logger.info("{} {} - (requested) [joinRoom] roomId: {}, player: {}", 
                getCurrentTime(), sessionId, request.roomId(), request.playerConfig().name());
    
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
    
            logger.info("{} {} - (response) [joinRoom] player joined room successfully: playerId: {}, roomId: {}", 
                    getCurrentTime(), sessionId, joiner.getId(), request.roomId());
    
            this.messagingTemplate.convertAndSend(
                    "/topic/" + request.roomId() + "/player-joined",
                    PlayerDto.fromPlayer(joiner)
            );
    
        } catch (IllegalArgumentException e) {
            logger.error("{} {} - (error) [joinRoom] failed to join room: {}, error: {}", 
                    getCurrentTime(), sessionId, request.roomId(), e.getMessage());

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

            this.messagingTemplate.convertAndSend(
                    "/topic/" + request.roomId() + "/player-left",
                    request.playerId()
            );
        } catch (IllegalArgumentException e) {
            logger.error("{} {} - (error) [adminKickPlayer] failed to kick player: {}, playerId: {}, error: {}", 
                    getCurrentTime(), headerAccessor.getSessionId(), request.roomId(), request.playerId(), e.getMessage());
                    
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
        String sessionId = headerAccessor.getSessionId();
        logger.info("{} {} - (requested) [playerReady] roomId: {}, playerId: {}", 
                getCurrentTime(), sessionId, request.roomId(), request.playerId());
                
        try {
            UUID roomUUID = UUID.fromString(request.roomId());
            UUID playerUUID = UUID.fromString(request.playerId());
            roomService.playerReady(roomUUID, playerUUID, sessionId);
    
            logger.info("{} {} - (response) [playerReady] player status updated to ready: playerId: {}, roomId: {}", 
                    getCurrentTime(), sessionId, request.playerId(), request.roomId());
    
            this.messagingTemplate.convertAndSend(
                    "/topic/" + request.roomId() + "/player-status-update",
                    new PlayerStatusResponse(request.playerId(), true)
            );
        } catch (IllegalArgumentException e) {
            logger.error("{} {} - (error) [playerReady] failed to set player ready: {}, playerId: {}, error: {}", 
                    getCurrentTime(), sessionId, request.roomId(), request.playerId(), e.getMessage());
                    
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

    @MessageMapping("/admin-remove-player")
    public void handleAdminKickPlayer(LeaveRequest request,
                                              SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        logger.info("{} {} - (requested) [adminKickPlayer] roomId: {}, playerId: {}", 
                getCurrentTime(), sessionId, request.roomId(), request.playerId());
                
        try {
            UUID roomUUID = UUID.fromString(request.roomId());
            UUID playerUUID = UUID.fromString(request.playerId());
            roomService.kickPlayer(roomUUID, playerUUID, sessionId);
    
            logger.info("{} {} - (response) [adminKickPlayer] player kicked from room: playerId: {}, roomId: {}", 
                    getCurrentTime(), sessionId, request.playerId(), request.roomId());
    
            this.messagingTemplate.convertAndSend(
                    "/topic/" + request.roomId() + "/player-left",
                    request.playerId()
            );
        } catch (IllegalArgumentException e) {
            logger.error("{} {} - (error) [adminKickPlayer] failed to kick player: {}, playerId: {}, error: {}", 
                    getCurrentTime(), sessionId, request.roomId(), request.playerId(), e.getMessage());
                    
            this.messagingTemplate.convertAndSend(
                    "/topic/" + request.roomId() + "/error",
                    new ErrorResponse(
                            "400", // Bad Request
                            e.getMessage()
                    )
            );
        }
    }

    @MessageMapping("/get-player-difficulty")
    public void handleGetPlayerDifficulty(PlayerDifficultyRequest request,
                                          SimpMessageHeaderAccessor headerAccessor) {
        try {
            UUID roomUUID = UUID.fromString(request.roomId());
            UUID playerUUID = UUID.fromString(request.playerId());

            DifficultyDto diff = roomService.getPlayerDifficulty(roomUUID, playerUUID, headerAccessor.getSessionId());
            this.messagingTemplate.convertAndSend(
                    "/topic/" + roomService.getAdmin(roomUUID).getId().toString() + "/difficulty",
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
    public void handleChangeDifficulty(PlayerDifficultyUpdateRequest request,
                                               SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        logger.info("{} {} - (requested) [changeDifficulty] roomId: {}, playerId: {}", 
                getCurrentTime(), sessionId, request.roomId(), request.playerId());
                
        try {
            UUID roomUUID = UUID.fromString(request.roomId());
            UUID playerUUID = UUID.fromString(request.playerId());
            DifficultyValues newDiff = roomService.changePlayerDifficulty(
                    roomUUID, 
                    playerUUID, 
                    new DifficultyValues().fromDto(request.difficulty_values()), 
                    sessionId
            );
            
            String adminId = roomService.getAdmin(roomUUID).getId().toString();
            logger.info("{} {} - (response) [changeDifficulty] difficulty changed for player: {}, notifying admin: {}", 
                    getCurrentTime(), sessionId, request.playerId(), adminId);
    
            this.messagingTemplate.convertAndSend(
                    "/topic/" + adminId + "/difficulty-changed",
                    DifficultyDto.fromDifficultyValues(newDiff)
            );
        } catch (IllegalArgumentException e) {
            logger.error("{} {} - (error) [changeDifficulty] failed to change difficulty: {}, playerId: {}, error: {}", 
                    getCurrentTime(), sessionId, request.roomId(), request.playerId(), e.getMessage());
                    
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
        String sessionId = headerAccessor.getSessionId();
        logger.info("{} {} - (requested) [restoreSession] roomId: {}, playerId: {}", 
                getCurrentTime(), sessionId, request.roomId(), request.playerId());
    
        try {
            UUID roomUUID = UUID.fromString(request.roomId());
            UUID playerUUID = UUID.fromString(request.playerId());
            SessionRestoreResponse resp = roomService.restoreSession(roomUUID, playerUUID, sessionId);
            
            logger.info("{} {} - (response) [restoreSession] session restored successfully for player: {}, room: {}", 
                    getCurrentTime(), sessionId, request.playerId(), request.roomId());
                    
            this.messagingTemplate.convertAndSend(
                    "/topic/" + request.playerId() + "/session-restored",
                    resp);
        } catch (IllegalArgumentException | NullPointerException e) {
            logger.error("{} {} - (error) [restoreSession] failed to restore session: roomId: {}, playerId: {}, error: {}", 
                    getCurrentTime(), sessionId, request.roomId(), request.playerId(), e.getMessage());
                    
            this.messagingTemplate.convertAndSend(
                    "/topic/" + request.playerId() + "/session-not-found",
                    new ErrorResponse(
                            "404", 
                            "Session not found"
                    )
            );
        }
    }
}
