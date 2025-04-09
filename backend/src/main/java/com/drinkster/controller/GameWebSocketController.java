package com.drinkster.controller;

import com.drinkster.dto.request.JoinRequest;
import com.drinkster.dto.response.JoinResponse;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class GameWebSocketController {

    // Track session IDs and room associations
    private final Map<String, String> sessionRoomMap = new ConcurrentHashMap<>();

    @MessageMapping("/join-room")
    @SendTo("/topic/room-events")
    public JoinResponse handleJoinRoom(JoinRequest request) {
        String sessionId = UUID.randomUUID().toString();
        sessionRoomMap.put(sessionId, request.roomId());
        return new JoinResponse(sessionId, "Joined room: " + request.roomId());
    }

}
