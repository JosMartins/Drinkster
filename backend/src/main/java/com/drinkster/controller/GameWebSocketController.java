package com.drinkster.controller;


import com.drinkster.dto.response.ErrorResponse;
import com.drinkster.service.RoomService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;
import java.util.UUID;


@Controller
public class GameWebSocketController {

    private final RoomService roomService;
    private final SimpMessagingTemplate messagingTemplate;

    public GameWebSocketController(RoomService roomService, SimpMessagingTemplate messagingTemplate) {
        this.roomService = roomService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/challenge-completed")
    public void handleChallengeCompleted(Map<String,String> payload, SimpMessageHeaderAccessor headerAccessor) {
        String playerId = payload.get("playerId");

        try {
            UUID roomUUID = UUID.fromString(payload.get("roomId"));
            UUID playerUUID = UUID.fromString(playerId);
            String sessionId = headerAccessor.getSessionId();

            roomService.completeChallenge(roomUUID, playerUUID, sessionId, false);

        } catch (IllegalArgumentException e) {
            messagingTemplate.convertAndSend("/topic/" + playerId + "/error",
                    new ErrorResponse("400", e.getMessage()));
        }
    }

    @MessageMapping("/challenge-drunk")
    public void handleChallengeDrunk(Map<String,String> payload, SimpMessageHeaderAccessor headerAccessor) {
        String playerId = payload.get("playerId");

        try {
            UUID roomUUID = UUID.fromString(payload.get("roomId"));
            UUID playerUUID = UUID.fromString(playerId);
            String sessionId = headerAccessor.getSessionId();

            roomService.completeChallenge(roomUUID, playerUUID, sessionId, true);

        } catch (IllegalArgumentException e) {
            messagingTemplate.convertAndSend("/topic/" + playerId + "/error",
                    new ErrorResponse("400", e.getMessage()));
        }
    }


    @MessageMapping("/admin-force-skip")
    public void handleAdminForceSkip(String roomId, SimpMessageHeaderAccessor headerAccessor) {
        roomService.forceSkipChallenge(roomId, headerAccessor.getSessionId());
    }

    /// HELPER ///



}
