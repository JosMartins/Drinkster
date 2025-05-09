package com.drinkster.controller;


import com.drinkster.dto.ChallengeDto;
import com.drinkster.dto.PenaltyDto;
import com.drinkster.dto.PlayerDto;
import com.drinkster.dto.response.ChallengeResponse;
import com.drinkster.dto.response.ErrorResponse;
import com.drinkster.model.*;
import com.drinkster.service.RoomService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Controller;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;


@Controller
public class GameWebSocketController {

    private final RoomService roomService;
    private final SimpMessagingTemplate messagingTemplate;
    private final TaskScheduler taskScheduler;
    private final Map<UUID, ScheduledFuture<?>> challengeTimeouts = new ConcurrentHashMap<>();

    public GameWebSocketController(RoomService roomService, SimpMessagingTemplate messagingTemplate, TaskScheduler taskScheduler) {
        this.roomService = roomService;
        this.messagingTemplate = messagingTemplate;
        this.taskScheduler = taskScheduler;
    }



    @MessageMapping("/challenge-{action}")
    public void handleChallenge(@DestinationVariable String action,
                                Map<String,String> payload,
                                SimpMessageHeaderAccessor headerAccessor) {
        String playerId = payload.get("playerId");

        try {
            UUID roomId = UUID.fromString(payload.get("roomId"));
            UUID playerUUID = UUID.fromString(payload.get("playerId"));
            String sessionId = headerAccessor.getSessionId();
            boolean drank = action.equals("drunk");

            if (!drank) {
                //Completed the challenge, so we complete challenge and see if there is a penalty to apply (handled in the service)
                roomService.completeChallenge(roomId,playerUUID, sessionId, false);
            } else {
                PlayerTurn currentTurn = roomService.getRoom(roomId).getCurrentTurn();
                switch (currentTurn.getChallenge().getType()) {
                    case YOU_DRINK -> {
                        currentTurn.registerResponse(playerUUID, true);
                    }
                    case BOTH_DRINK -> {}
                    case CHOSEN_DRINK -> {}
                    case EVERYONE_DRINK -> {}
                    default -> {}

                }

                roomService.completeChallenge(roomId, playerUUID, sessionId, true);
            }



            // Send the next challenge to all players in the room
            sendNextChallenge(roomId);
        } catch (IllegalArgumentException e) {
            messagingTemplate.convertAndSend("/topic/" + playerId + "/error",
                    new ErrorResponse("400", e.getMessage()));
        } catch (NullPointerException e) {
            messagingTemplate.convertAndSend("/topic/" + playerId + "/error",
                    new ErrorResponse("400", "Missing required parameters"));
        }

    }


    @MessageMapping("/admin-force-skip")
    public void handleAdminForceSkip(String roomId, SimpMessageHeaderAccessor headerAccessor) {

        try {
            roomService.forceSkipChallenge(roomId, headerAccessor.getSessionId());

            this.sendNextChallenge(UUID.fromString(roomId));
        } catch (IllegalArgumentException e) {
            messagingTemplate.convertAndSend("/topic/" + roomId + "/error",
                    new ErrorResponse("400", e.getMessage()));
        } catch (NullPointerException e) {
            messagingTemplate.convertAndSend("/topic/" + roomId + "/error",
                    new ErrorResponse("400", "Missing required parameters"));
        }
    }

    /// HELPER ///

    private void sendNextChallenge(UUID roomID) {

        GameRoom room = roomService.getRoom(roomID);
        roomService.startNextTurn(roomID);
        if (room == null) {
            return;
        }

        for (Player player : room.getPlayers()) {
            if (player.getSocketId() != null) {
                ChallengeResponse response = new ChallengeResponse(
                        ChallengeDto.fromChallenge(room.getCurrentTurn().getChallenge()),
                        room.getCurrentTurn().getAffectedPlayers().stream().map(PlayerDto::fromPlayer).toList(),
                        player.getPenalties().stream().map(PenaltyDto::fromPenalty).toList()
                );
                messagingTemplate.convertAndSend("/topic/" + player.getId() +  "/challenge", response);
            }
        }

        ScheduledFuture<?> future = taskScheduler.schedule(
                () -> handleTimeout(roomID),
                Instant.now().plus(5, ChronoUnit.MINUTES)
        );
        cancelTimer(roomID); //just for safety
        challengeTimeouts.put(roomID, future);
    }

        /// TIMERS ///

    /**
     * Handles the timeout event for a challenge.
     *
     * @param roomId the ID of the room
     */
    private void handleTimeout(UUID roomId) {
        this.sendNextChallenge(roomId);

    }


    /**
     * Cancels the timer for the given room ID.
     *
     * @param roomId the ID of the room
     */
    private void cancelTimer(UUID roomId) {
        var future = challengeTimeouts.remove(roomId);
        if (future != null) {
            future.cancel(false);
        }
    }

}
