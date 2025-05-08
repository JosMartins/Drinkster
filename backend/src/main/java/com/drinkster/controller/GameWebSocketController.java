package com.drinkster.controller;


import com.drinkster.dto.ChallengeDto;
import com.drinkster.dto.PenaltyDto;
import com.drinkster.dto.PlayerDto;
import com.drinkster.dto.response.ChallengeResponse;
import com.drinkster.dto.response.ErrorResponse;
import com.drinkster.model.*;
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
            GameRoom room = roomService.getRoom(roomUUID);
            Challenge challenge = room.getCurrentTurn().challenge();

            // 4. Dispatch based on the challenge type by delegating to helper methods.
            //    Each helper should:
            //      - send WebSocket messages via messagingTemplate to relevant /topic/{playerId}
            //      -send to the players not in the challenge that the player X and Y are doing a challenge / drinking z
            //      - handle any game logic (e.g., updating player states, etc.)
            //      - manage UI flow (confirmations, votes, etc.)
            switch (challenge.getType()) {
                case YOU_DRINK -> {
                    // TODO: should we send a event (so it would appear as a "popup") to the player or
                    //       just accept the he already drunk? maybe, because on BOTH_DRINK we
                    //       will send a event to both players.
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


            roomService.completeChallenge(roomUUID, playerUUID, sessionId, false);

            this.sendNextChallenge(roomUUID);

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

    private void sendNextChallenge(UUID roomID) {

        GameRoom room = roomService.getRoom(roomID);

        if (room == null) {
            return;
        }

        for (Player player : room.getPlayers()) {
            if (player.getSocketId() != null) {
                ChallengeResponse response = new ChallengeResponse(
                        ChallengeDto.fromChallenge(room.getCurrentTurn().challenge()),
                        room.getCurrentTurn().affectedPlayers().stream().map(PlayerDto::fromPlayer).toList(),
                        player.getPenalties().stream().map(PenaltyDto::fromPenalty).toList()
                );
                messagingTemplate.convertAndSend("/topic/" + player.getId() +  "/challenge", response);
            }
        }
    }
}
