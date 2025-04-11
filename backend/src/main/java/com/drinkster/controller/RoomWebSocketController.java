package com.drinkster.controller;

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


    @MessageMapping("/list-rooms")
    @SendTo("/topic/rooms-list")
    public RoomListResponse listRooms() {
        return new RoomListResponse(roomService.getRooms());

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
                RoomMode.valueOf(request.mode()),
                request.rememberCount(),
                request.showChallenges());

        return new RoomCreatedResponse(room.getId().toString(), admin.getId().toString());
    }


    @MessageMapping("/join-room")
    @SendTo("/topic/room-joined")
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
}
