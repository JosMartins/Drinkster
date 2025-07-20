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
     */
    @MessageMapping("/list-rooms")
    public void listRooms(SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor != null ? headerAccessor.getSessionId() : "unknown";
        if (sessionId == null) {
            logger.warn("{} - (warning) [listRooms] sessionId is null, cannot process request", getCurrentTime());
            return; // Cannot proceed without a valid session ID
        }

        logger.info("{} {} - (requested) [listRooms]", getCurrentTime(), sessionId);

        RoomListResponse response = new RoomListResponse(
                roomService.getRooms().stream()
                        .map(RoomListItemDto::fromGameRoom)
                        .toArray(RoomListItemDto[]::new)
        );
        
        logger.info("{} {} - (response) [listRooms] returned {} rooms", 
                getCurrentTime(), sessionId, response.rooms().length);

        messagingTemplate.convertAndSendToUser(sessionId, "/queue/room-list", response);
    }

    @MessageMapping("/get-room")
    public void getRoom(String roomId,
                        SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        if (sessionId == null) {
            logger.warn("{} - (warning) [getRoom] sessionId is null, cannot process request", getCurrentTime());
            return; // Cannot proceed without a valid session ID
        }

        logger.info("{} {} - (requested) [getRoom] roomId: {}", getCurrentTime(), sessionId, roomId);
        
        try {
            UUID roomUUID = UUID.fromString(roomId);
            GameRoom room = roomService.getRoom(roomUUID);

            this.messagingTemplate.convertAndSendToUser(sessionId, "/queue/room-info", GameRoomDto.fromGameRoom(room));
            
            logger.info("{} {} - (response) [getRoom] sent room info for roomId: {}, players: {}", 
                    getCurrentTime(), sessionId, roomId, room.getPlayers().size());
        } catch (IllegalArgumentException e) {
            logger.error("{} {} - (error) [getRoom] invalid roomId: {} - {}", 
                    getCurrentTime(), sessionId, roomId, e.getMessage());
            
            this.messagingTemplate.convertAndSendToUser(
                    sessionId,
                    "/queue/room-error",
                    new ErrorResponse(
                            400, // Bad Request
                            "Invalid room ID format"
                    )
            );
        } catch (NullPointerException e) {
            logger.error("{} {} - (error) [getRoom] room not found: {}", 
                    getCurrentTime(), sessionId, roomId);
            
            this.messagingTemplate.convertAndSendToUser(
                    sessionId,
                    "/queue/room-error",
                    new ErrorResponse(
                            404, // Not Found
                            "Room not found"
                    )
            );
        }
    }

    @MessageMapping("/create-room")
    public void handleCreateRoom(CreateRoomRequest request,
                                                SimpMessageHeaderAccessor headerAccessor) {

        String sessionId = headerAccessor.getSessionId();

        if (sessionId == null) {
            logger.warn("{} - (warning) [createRoom] sessionId is null, cannot process request", getCurrentTime());
            return; // Cannot proceed without a valid session ID
        }

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
    
            messagingTemplate.convertAndSendToUser(sessionId, "/queue/room-created",
                    new RoomCreatedResponse(room.getId().toString(), admin.getId().toString()));
        } catch (IllegalArgumentException e) {
            logger.error("{} {} - (error) [createRoom] IllegalArgumentException: {}", 
                    getCurrentTime(), sessionId, e.getMessage());
            messagingTemplate.convertAndSendToUser(sessionId,"/queue/room-error" ,new ErrorResponse(400, e.getMessage()));
        } catch (NullPointerException e) {
            logger.error("{} {} - (error) [createRoom] NullPointerException: {}", 
                    getCurrentTime(), sessionId, e.getMessage());
            messagingTemplate.convertAndSendToUser(
                    sessionId,
                    "/queue/room-error",
                    new ErrorResponse(404, "Missing required parameters"));
        }
    }


    @MessageMapping("/join-room")
    public void handleJoinRoom(JoinRequest request,
                               SimpMessageHeaderAccessor headerAccessor) {

        String sessionId = headerAccessor.getSessionId();
        if (sessionId == null) {
            logger.warn("{} - (warning) [joinRoom] sessionId is null, cannot process request", getCurrentTime());
            return; // Cannot proceed without a valid session ID
        }

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

            this.messagingTemplate.convertAndSendToUser(
                    sessionId,
                    "/queue/join-confirm",
                    new JoinResponse(
                            "Successfully joined room",
                            joiner.getId().toString()
                    )
            );
    
        } catch (IllegalArgumentException e) {
            logger.error("{} {} - (error) [joinRoom] failed to join room: {}, error: {}", 
                    getCurrentTime(), sessionId, request.roomId(), e.getMessage());

            this.messagingTemplate.convertAndSendToUser(
                    sessionId,
                    "queue/join-error",
                    new ErrorResponse(
                            400, // Bad Request
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
                            400, // Bad Request
                            e.getMessage()
                    )
            );
        }
    }

    @MessageMapping("/player-ready")
    public void playerReady(PlayerStatusUpdateRequest request,
                                    SimpMessageHeaderAccessor headerAccessor){
        String sessionId = headerAccessor.getSessionId();
        if (sessionId == null) {
            logger.warn("{} - (warning) [playerReady] sessionId is null, cannot process request", getCurrentTime());
            return; // Cannot proceed without a valid session ID
        }

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

            this.messagingTemplate.convertAndSendToUser(
                    sessionId,
                    "/queue/player-ready",
                    true
            );

        } catch (IllegalArgumentException e) {
            logger.error("{} {} - (error) [playerReady] failed to set player ready: {}, playerId: {}, error: {}", 
                    getCurrentTime(), sessionId, request.roomId(), request.playerId(), e.getMessage());
                    
            this.messagingTemplate.convertAndSendToUser(sessionId,
                    "/queue/player-error",
                    new ErrorResponse(
                            400, // Bad Request
                            e.getMessage()
                    )
            );
        }
    }

    @MessageMapping("/player-unready")
    public void playerUnready(PlayerStatusUpdateRequest request,
                                    SimpMessageHeaderAccessor headerAccessor){
        String sessionId = headerAccessor.getSessionId();

        if (sessionId == null) {
            logger.warn("{} - (warning) [playerUnready] sessionId is null, cannot process request", getCurrentTime());
            return;
        }

        logger.info("{} {} - (requested) [playerUnready] roomId: {}, playerId: {}",
                getCurrentTime(), sessionId, request.roomId(), request.playerId());

        try {
            UUID roomUUID = UUID.fromString(request.roomId());
            UUID playerUUID = UUID.fromString(request.playerId());
            roomService.playerUnready(roomUUID, playerUUID, headerAccessor.getSessionId());

            this.messagingTemplate.convertAndSend(
                    "/topic/" + request.roomId() + "/player-status-update",
                    new PlayerStatusResponse(request.playerId(), false)
            );

            this.messagingTemplate.convertAndSendToUser(
                    sessionId,
                    "/queue/player-status-update",
                    false
            );
        } catch (IllegalArgumentException e) {
            this.messagingTemplate.convertAndSendToUser(sessionId,
                    "/queue/player-error",
                    new ErrorResponse(
                            400, // Bad Request
                            e.getMessage()
                    )
            );
        }

    }

    @MessageMapping("/admin-remove-player")
    public void handleAdminKickPlayer(LeaveRequest request,
                                              SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        if (sessionId == null) {
            logger.warn("{} - (warning) [adminKickPlayer] sessionId is null, cannot process request", getCurrentTime());
            return; // Cannot proceed without a valid session ID
        }

        logger.info("{} {} - (requested) [adminKickPlayer] roomId: {}, playerId: {}", 
                getCurrentTime(), sessionId, request.roomId(), request.playerId());
                
        try {
            UUID roomUUID = UUID.fromString(request.roomId());
            UUID playerUUID = UUID.fromString(request.playerId());
            String playerSocket = roomService.getRoom(roomUUID).getPlayer(playerUUID).getSocketId();
            roomService.kickPlayer(roomUUID, playerUUID, sessionId);
    
            logger.info("{} {} - (response) [adminKickPlayer] player kicked from room: playerId: {}, roomId: {}", 
                    getCurrentTime(), sessionId, request.playerId(), request.roomId());
    
            this.messagingTemplate.convertAndSend(
                    "/topic/" + request.roomId() + "/player-left",
                    request.playerId()
            );

            this.messagingTemplate.convertAndSendToUser(playerSocket,
                    "/queue/kicked",
                    "You have been kicked from the room by the admin."
            );
        } catch (IllegalArgumentException e) {
            logger.error("{} {} - (error) [adminKickPlayer] failed to kick player: {}, playerId: {}, error: {}", 
                    getCurrentTime(), sessionId, request.roomId(), request.playerId(), e.getMessage());
                    
            this.messagingTemplate.convertAndSendToUser(sessionId,
                    "/queue/error",
                    new ErrorResponse(
                            400, // Bad Request
                            e.getMessage()
                    )
            );
        }
    }

    @MessageMapping("/get-player-difficulty")
    public void handleGetPlayerDifficulty(PlayerDifficultyRequest request,
                                          SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        if (sessionId == null) {
            logger.warn("{} - (warning) [getPlayerDifficulty] sessionId is null, cannot process request", getCurrentTime());
            return; // Cannot proceed without a valid session ID
        }
        try {
            UUID roomUUID = UUID.fromString(request.roomId());
            UUID playerUUID = UUID.fromString(request.playerId());

            DifficultyDto diff = roomService.getPlayerDifficulty(roomUUID, playerUUID, headerAccessor.getSessionId());
            this.messagingTemplate.convertAndSendToUser(sessionId,
                    "/queue/player-difficulty",
                    diff
            );
        } catch (IllegalArgumentException e) {
            this.messagingTemplate.convertAndSendToUser(sessionId,
                    "/queue/player-error",
                    new ErrorResponse(
                            400, // Bad Request
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

        if (sessionId == null) {
            logger.warn("{} - (warning) [changeDifficulty] sessionId is null, cannot process request", getCurrentTime());
            return; // Cannot proceed without a valid session ID
        }
        try {
            UUID roomUUID = UUID.fromString(request.roomId());
            UUID playerUUID = UUID.fromString(request.playerId());
            DifficultyValues newDiff = roomService.changePlayerDifficulty(
                    roomUUID, 
                    playerUUID, 
                    new DifficultyValues().fromDto(request.difficulty_values()), 
                    sessionId
            );
            
            String adminId = roomService.getAdmin(roomUUID).getSocketId();
            logger.info("{} {} - (response) [changeDifficulty] difficulty changed for player: {}, notifying admin: {}", 
                    getCurrentTime(), sessionId, request.playerId(), adminId);
    
            this.messagingTemplate.convertAndSendToUser(adminId,
                    "/queue/difficulty-changed",
                    DifficultyDto.fromDifficultyValues(newDiff)
            );
        } catch (IllegalArgumentException e) {
            logger.error("{} {} - (error) [changeDifficulty] failed to change difficulty: {}, playerId: {}, error: {}", 
                    getCurrentTime(), sessionId, request.roomId(), request.playerId(), e.getMessage());
                    
            this.messagingTemplate.convertAndSendToUser(sessionId,
                    "/topic/" + request.roomId() + "/error",
                    new ErrorResponse(
                            400, // Bad Request
                            e.getMessage()
                    )
            );
        }
    }


    // SESSION RESTORE //


    @MessageMapping("/restore-session")
    public void restoreSession(SessionRestoreRequest request, SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        if (sessionId == null) {
            logger.warn("{} - (warning) [restoreSession] sessionId is null, cannot process request", getCurrentTime());
            return; // Cannot proceed without a valid session ID
        }

        logger.info("{} {} - (requested) [restoreSession] roomId: {}, playerId: {}", 
                getCurrentTime(), sessionId, request.roomId(), request.playerId());
    
        try {
            UUID roomUUID = UUID.fromString(request.roomId());
            UUID playerUUID = UUID.fromString(request.playerId());
            SessionRestoreResponse resp = roomService.restoreSession(roomUUID, playerUUID, sessionId);
            
            logger.info("{} {} - (response) [restoreSession] session restored successfully for player: {}, room: {}", 
                    getCurrentTime(), sessionId, request.playerId(), request.roomId());
                    
            this.messagingTemplate.convertAndSendToUser(sessionId,
                    "/queue/session-restored",
                    resp);
        } catch (IllegalArgumentException | NullPointerException e) {
            logger.error("{} {} - (error) [restoreSession] failed to restore session: roomId: {}, playerId: {}, error: {}", 
                    getCurrentTime(), sessionId, request.roomId(), request.playerId(), e.getMessage());
                    
            this.messagingTemplate.convertAndSendToUser(sessionId,
                    "/queue/session-error",
                    new ErrorResponse(
                            404,
                            "Session not found"
                    )
            );
        }
    }
}
