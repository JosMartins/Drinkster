package com.drinkster.controller;

import com.drinkster.dto.ChallengeDto;
import com.drinkster.dto.PenaltyDto;
import com.drinkster.dto.PlayerDto;
import com.drinkster.dto.response.AckResponse;
import com.drinkster.dto.response.ChallengeResponse;
import com.drinkster.dto.response.ErrorResponse;
import com.drinkster.dto.response.StartGameResponse;
import com.drinkster.model.*;
import com.drinkster.service.RandomEventService;
import com.drinkster.service.RoomService;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Controller;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.ThreadLocalRandom;

/**
 * GameWebSocketController handles WebSocket messages related to game actions.
 * It manages game state, player actions, and challenges in a multiplayer game environment.
 */
@Controller
public class GameWebSocketController {

    private static final Logger logger = LoggerFactory.getLogger(GameWebSocketController.class);
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");

    private final RandomEventService randomEventService;
    private final RoomService roomService;
    private final SimpMessagingTemplate messagingTemplate;
    private final TaskScheduler taskScheduler;
    private final Map<UUID, ScheduledFuture<?>> challengeTimeouts = new ConcurrentHashMap<>();
    private final Map<String, Instant> lastActionTimes = new ConcurrentHashMap<>();

    /**
     * Constructs a GameWebSocketController with the required services.
     *
     * @param roomService the service for managing game rooms
     * @param messagingTemplate the template for sending messages to clients
     * @param taskScheduler the scheduler for scheduling tasks
     * @param randomEventService the service for handling random events in the game
     */
    public GameWebSocketController(RoomService roomService,
                                   SimpMessagingTemplate messagingTemplate,
                                   @Qualifier("taskScheduler") TaskScheduler taskScheduler,
                                   RandomEventService randomEventService) {
        this.roomService = roomService;
        this.messagingTemplate = messagingTemplate;
        this.taskScheduler = taskScheduler;
        this.randomEventService = randomEventService;
        logger.info("{} - (initialized) [GameWebSocketController]", getCurrentTime());
    }
    
    /**
     * Gets the current time formatted as a string
     * @return formatted current time
     */
    private String getCurrentTime() {
        return LocalDateTime.now().format(formatter);
    }

    /**
     * Initializes the controller by setting up a cleanup task for old action timestamps.
     * This task runs every 4 minutes to remove entries older than 5 minutes from the lastActionTimes map.
     */
    @PostConstruct
    public void init() {
        logger.info("{} - (initialization) [init] Setting up cleanup task for lastActionTimes", getCurrentTime());
        // Cleanup old entries every minute
        taskScheduler.scheduleAtFixedRate(() -> {
            Instant cutoff = Instant.now().minusSeconds(300);
            int beforeSize = lastActionTimes.size();
            lastActionTimes.entrySet().removeIf(entry ->
                    entry.getValue().isBefore(cutoff)
            );
            int afterSize = lastActionTimes.size();
            if (beforeSize != afterSize) {
                logger.info("{} - (cleanup) [lastActionTimes] Removed {} old entries", 
                        getCurrentTime(), beforeSize - afterSize);
            }
        }, Duration.ofMinutes(4));
    }

    /**
     * Handles the start game event.
     *
     * @param roomId the ID of the room to start the game in
     * @param headerAccessor the message header accessor
     */
    @MessageMapping("/start-game")
    public void handleStartGame(String roomId,
                                SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        if (sessionId == null) {
            logger.warn("{} unknown - (error) [startGame] No sessionId provided", getCurrentTime());
            return;
        }

        logger.info("{} {} - (requested) [startGame] roomId: {}", getCurrentTime(), sessionId, roomId);
        
        try {
            UUID roomUUID = UUID.fromString(roomId);
            roomService.startGame(roomUUID, sessionId);
            
            logger.info("{} {} - (response) [startGame] game started for room: {}", 
                    getCurrentTime(), sessionId, roomId);
    
            this.messagingTemplate.convertAndSend("/topic/" + roomId + "/game-started",
                    new StartGameResponse());
            taskScheduler.schedule(() -> this.sendNextChallenge(roomUUID),
                    Instant.now().plus(5, ChronoUnit.SECONDS) // delay the first challenge by 5 seconds so that the frontend has time to load
            );

        } catch (IllegalArgumentException e) {
            logger.error("{} {} - (error) [startGame] failed to start game for room: {}, error: {}", 
                    getCurrentTime(), sessionId, roomId, e.getMessage());
                    
            this.messagingTemplate.convertAndSendToUser(sessionId, "/queue/start-error",
                    new ErrorResponse(400, e.getMessage()));
        }
    }

    /**
     * Handles the challenge event.
     *
     * @param action the action to be performed ("drank" or "completed")
     * @param payload the payload containing the player ID and room ID
     * @param headerAccessor the message header accessor
     */
    @MessageMapping("/challenge-{action}")
    public void handleChallenge(@DestinationVariable String action,
                                Map<String,String> payload,
                                SimpMessageHeaderAccessor headerAccessor) {
        String playerId = payload.get("playerId");
        String roomId = payload.get("roomId");
        String sessionId = headerAccessor.getSessionId();
        String rateLimitKey = sessionId + "-" + action;
        
        logger.info("{} {} - (requested) [challenge-{}] playerId: {}, roomId: {}", 
                getCurrentTime(), sessionId, action, playerId, roomId);
    
        if (sessionId == null) {
            logger.warn("{} unknown - (error) [challenge-{}] No sessionId provided", 
                    getCurrentTime(), action);
            // ? no sessionId no action
            return;
        }
        
        // Allow 1 action every 2 seconds
        Instant lastAction = lastActionTimes.get(rateLimitKey);
        if (lastAction != null && lastAction.plusSeconds(4).isAfter(Instant.now())) {
            logger.warn("{} {} - (error) [challenge-{}] Rate limited, too many actions", 
                    getCurrentTime(), sessionId, action);
                    
            messagingTemplate.convertAndSendToUser(
                    sessionId,
                    "/queue/challenge-error",
                    new ErrorResponse(429, "Too many actions")
            );
            return;
        }

        lastActionTimes.put(rateLimitKey, Instant.now());

        try {
            UUID roomUUID = UUID.fromString(payload.get("roomId"));
            UUID playerUUID = UUID.fromString(payload.get("playerId"));
        
            boolean drank = "drank".equals(action);
            PlayerTurn currentTurn = roomService.getRoom(roomUUID).getCurrentTurn();
        
            if (currentTurn == null) {
                logger.error("{} {} - (error) [challenge-{}] No current turn found for room: {}", 
                        getCurrentTime(), sessionId, action, roomUUID);
                throw new IllegalArgumentException("No current turn found");
            }
        
            //if the player is affected by the challenge, and if the player's socketId is the same as the one in the payload
            if (!currentTurn.getAffectedPlayers().isEmpty() &&
                    currentTurn.getAffectedPlayers().stream().noneMatch(p -> p.getId().equals(playerUUID) && p.getSocketId().equals(sessionId))) {
                logger.error("{} {} - (error) [challenge-{}] Player not affected by the challenge: playerId: {}, roomId: {}", 
                        getCurrentTime(), sessionId, action, playerUUID, roomUUID);
                throw new IllegalArgumentException("Player not affected by the challenge");
            }
        
            logger.info("{} {} - (processing) [challenge-{}] Registering response: {}, playerId: {}, roomId: {}, challenge type: {}", 
                    getCurrentTime(), sessionId, action, drank ? "drank" : "not drank", playerUUID, roomUUID, 
                    currentTurn.getChallenge().getType());
        
            switch (currentTurn.getChallenge().getType()) {
                    case YOU_DRINK, BOTH_DRINK, EVERYONE_DRINK -> currentTurn.registerResponse(playerUUID, drank);
        
                case CHOSEN_DRINK -> 
                        /*TODO:
                            Start vote for everyone, when all players vote, send to the chosen player a drinking event.
                            doVote(playerUUID, votedUUID);
                            for now this will not be implemented.
                        */
                        logger.info("{} {} - (processing) [challenge-{}] CHOSEN_DRINK not implemented yet", 
                                getCurrentTime(), sessionId, action);

        
                default -> logger.info("{} {} - (processing) [challenge-{}] Unhandled challenge type: {}",
                            getCurrentTime(), sessionId, action, currentTurn.getChallenge().getType());
                            /*do nothing*/
            }

            // Send acknowledgment to the player
            this.messagingTemplate.convertAndSendToUser(sessionId,
                    "/queue/ack",
                    new AckResponse("challenge-" + action, true)

            );

            if (currentTurn.allResponded()) {
                logger.info("{} {} - (response) [challenge-{}] All players responded, proceeding to next challenge", 
                        getCurrentTime(), sessionId, action);
                
                int drunkPlayers = currentTurn.playersDrunk().size();
                int completedPlayers = currentTurn.playersCompleted().size();
                
                currentTurn.playersDrunk().forEach(p -> {
                    int before = p.getDrinks();
                    p.addSips(currentTurn.getChallenge().getSips());
                    int after = p.getDrinks();
                    boolean crossed = before / RandomEventService.SIPS_PER_GLASS < after / RandomEventService.SIPS_PER_GLASS;

                    if (crossed) {
                        randomEventService.startGlassWindow(p);
                    }

                });
                logger.info("{} {} - (response) [challenge-{}] Added sips to {} players", 
                        getCurrentTime(), sessionId, action, drunkPlayers);
        
                currentTurn.playersCompleted().forEach(p -> {
                            var penalty = currentTurn.getChallenge().getPenalty();
                            if (penalty != null) p.addPenalty(penalty);
                        });
                logger.info("{} {} - (response) [challenge-{}] Added penalties to {} players", 
                        getCurrentTime(), sessionId, action, completedPlayers);
        
                sendNextChallenge(roomUUID);
            } else {
                logger.info("{} {} - (response) [challenge-{}] Waiting for more responses before proceeding", 
                        getCurrentTime(), sessionId, action);
            }
        
        } catch (IllegalArgumentException e) {
            logger.error("{} {} - (error) [challenge-{}] IllegalArgumentException: {}", 
                    getCurrentTime(), sessionId, action, e.getMessage());
                    
            messagingTemplate.convertAndSendToUser(sessionId,"/queue/challenge-error",
                    new ErrorResponse(400, e.getMessage()));
        } catch (NullPointerException e) {
            logger.error("{} {} - (error) [challenge-{}] NullPointerException: {}", 
                    getCurrentTime(), sessionId, action, e.getMessage());
                    
            messagingTemplate.convertAndSendToUser(sessionId,"/queue/challenge-error",
                    new ErrorResponse(400, "Missing required parameters"));
        }

    }


    /**
     * Handles the admin force skip event.
     *
     * @param roomId the ID of the room
     * @param headerAccessor the message header accessor
     */
    @MessageMapping("/admin-force-skip")
    public void handleAdminForceSkip(String roomId, SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();

        if (sessionId == null) {
            logger.warn("{} unknown - (error) [adminForceSkip] No sessionId provided", getCurrentTime());
            return;
        }

        logger.info("{} {} - (requested) [adminForceSkip] roomId: {}", getCurrentTime(), sessionId, roomId);
    
        try {
            roomService.forceSkipChallenge(roomId, sessionId);
            
            logger.info("{} {} - (response) [adminForceSkip] challenge skipped for room: {}", 
                    getCurrentTime(), sessionId, roomId);
    
            this.sendNextChallenge(UUID.fromString(roomId));
        } catch (IllegalArgumentException e) {
            logger.error("{} {} - (error) [adminForceSkip] IllegalArgumentException: {}", 
                    getCurrentTime(), sessionId, e.getMessage());
                    
            messagingTemplate.convertAndSendToUser(sessionId, "/user/queue/skip-error",
                    new ErrorResponse(400, e.getMessage()));
        } catch (NullPointerException e) {
            logger.error("{} {} - (error) [adminForceSkip] NullPointerException: {}", 
                    getCurrentTime(), sessionId, e.getMessage());

            messagingTemplate.convertAndSendToUser(sessionId, "/user/queue/skip-error",
                    new ErrorResponse(400, "Missing required parameters"));
        }
    }

    // HELPERS //

    /**
     * Sends the next challenge to all players in the specified game room and schedules a timeout event.
     *
     * @param roomID the unique identifier of the game room
     */
    private void sendNextChallenge(UUID roomID) {
        logger.info("{} - (processing) [sendNextChallenge] for roomId: {}", getCurrentTime(), roomID);
        
        GameRoom room = roomService.getRoom(roomID);
    
        if (room == null) {
            logger.error("{} - (error) [sendNextChallenge] Room not found: {}", getCurrentTime(), roomID);
            return;
        }
        // Send wait message to all players

        for (Player player : room.getPlayers()) {
            int waitSips = ThreadLocalRandom.current().nextInt(1, 6);
            ChallengeDto waitChallenge = new ChallengeDto(

                    "Getting challenge ready...  Drink " + waitSips + " sips while you wait!",
                    "EASY",
                    "EVERYONE_DRINK",
                    false);

            messagingTemplate.convertAndSendToUser(
                    player.getSocketId(),
                    "/queue/wait-challenge",
                    waitChallenge
            );
        }
        room.handlePenalties();
        logger.info("{} - (processing) [sendNextChallenge] Handled penalties for room: {}", getCurrentTime(), roomID);
        
        roomService.startNextTurn(roomID);
        logger.info("{} - (processing) [sendNextChallenge] Started next turn for room: {}, round: {}", 
                getCurrentTime(), roomID, room.getRoundNumber());
    
        int notifiedPlayers = 0;
        for (Player player : room.getPlayers()) {
            if (player.getSocketId() != null) {

                PlayerDto[] affectedPlayers = room.getCurrentTurn().getAffectedPlayers().stream()
                        .map(PlayerDto::fromPlayer)
                        .toArray(PlayerDto[]::new);

                PenaltyDto[] penalties = player.getPenalties().stream()
                        .map(PenaltyDto::fromPenalty)
                        .toArray(PenaltyDto[]::new);


                ChallengeResponse response = new ChallengeResponse(
                        ChallengeDto.fromChallenge(room.getCurrentTurn().getChallenge()), //challenge
                        affectedPlayers, //affected players
                        room.getRoundNumber(), //round
                        penalties //penalties
                );
                messagingTemplate.convertAndSendToUser(player.getSocketId(),
                        "/queue/challenge",
                        response);
                notifiedPlayers++;
            }
        }
        
        logger.info("{} - (response) [sendNextChallenge] Sent challenge to {} players in room: {}, challenge id: {}",
                getCurrentTime(), notifiedPlayers, roomID, room.getCurrentTurn().getChallenge().getId());
    
        ScheduledFuture<?> future = taskScheduler.schedule(
                () -> handleTimeout(roomID),
                Instant.now().plus(10, ChronoUnit.MINUTES)
        );
        cancelTimer(roomID); //for safety
        challengeTimeouts.put(roomID, future);
        
        logger.info("{} - (processing) [sendNextChallenge] Set challenge timeout for room: {} for 5 minutes", 
                getCurrentTime(), roomID);
    }


    // TIMERS //

    /**
     * Handles the timeout event for a challenge.
     *
     * @param roomId the ID of the room
     */
    private void handleTimeout(UUID roomId) {
        logger.info("{} - (timeout) [handleTimeout] Challenge timed out for room: {}", getCurrentTime(), roomId);
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
            logger.info("{} - (processing) [cancelTimer] Canceled timer for room: {}", getCurrentTime(), roomId);
        }
    }

}
