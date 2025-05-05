package com.drinkster.controller;


import com.drinkster.dto.response.ErrorResponse;
import com.drinkster.model.Challenge;
import com.drinkster.model.Player;
import com.drinkster.model.PlayerTurn;
import com.drinkster.service.RoomService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
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

            PlayerTurn nextTurn = roomService.startNextTurn(roomUUID);
            this.sendNextChallenge(roomUUID, nextTurn);

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

    private void sendNextChallenge(UUID roomID,PlayerTurn nextTurn) {

        if (nextTurn == null) {
            return;
        }

        Challenge challenge = nextTurn.challenge();
        ArrayList<Player> notInChallenge = (ArrayList<Player>) roomService.getRoom(roomID).getPlayers().stream()
                                      .filter(p -> !nextTurn.affectedPlayers().contains(p)).toList();

        // 4. Dispatch based on the challenge type by delegating to helper methods.
        //    Each helper should:
        //      - send WebSocket messages via messagingTemplate to relevant /topic/{playerId}
        //      - manage UI flow (confirmations, votes, etc.)
        switch (challenge.getType()) {
            case YOU_DRINK -> {
                // TODO: prompt only nextTurn.player() to drink or perform challenge.
                //       Include challenge text and sip count in payload.
            }
            case BOTH_DRINK -> {
                // TODO: prompt both players in nextTurn.affectedPlayers().
                //       On first "drink" event, broadcast sip action to both.
                //       On "done" from turn player, proceed to next turn.
            }
            case EVERYONE_DRINK -> {
                // TODO: prompt everyone in the room.
                //       Track confirmations so we know when all have drunk.
                //       Then call startNextTurn.
            }
            case CHOSEN_DRINK -> {
                // TODO: initiate vote among notInChallenge.
                //       Collect votes, identify most voted player.
                //       Send direct drink event to that player.
            }
            default -> {
                // Graceful fallback for future types.
            }
        }
    }
}
