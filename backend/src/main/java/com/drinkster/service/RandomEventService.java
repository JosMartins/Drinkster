package com.drinkster.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class RandomEventService {
    public static final int SIPS_PER_GLASS = 20;
    private static final Duration GLASS_WINDOW         = Duration.ofMinutes(3);
    private static final Duration GLASS_POLL_INTERVAL  = Duration.ofSeconds(30);
    private static final double   GLASS_REMINDER_CHANCE = 0.15;


    private static final String HOURLY_MSG = "It's been an hour! Drink a shot.";
    private static final double BROADCAST_CHANCE = 0.03;          // 3 %
    private static final List<String> RANDOM_BROADCASTS = List.of(
            "Touch the floor and drink 2 sips!",
            "Everyone swap seats and drink 2 sip."
    );
    private final Map<UUID, Instant> glassWindows = new ConcurrentHashMap<>();


    private final RoomService roomService;
    private final SimpMessagingTemplate messagingTemplate;
    private final TaskScheduler taskScheduler;
    private final Random rng = new Random();


    @PostConstruct
    public void init() {
        /* 1 ─ Hourly “drink a shot” event */
        taskScheduler.scheduleAtFixedRate(this::sendHourlyEvent, Duration.ofHours(1));

        /* 2 ─ 3 % broadcast event every minute */
        taskScheduler.scheduleAtFixedRate(this::maybeBroadcastRandomEvent, Duration.ofMinutes(1));

        taskScheduler.scheduleAtFixedRate(this::maybeSendGlassReminders, GLASS_POLL_INTERVAL);


    }

    public void startGlassWindow(UUID playerId) {
        glassWindows.put(playerId, Instant.now().plus(GLASS_WINDOW));
    }


    private void sendHourlyEvent() {
        roomService.getRooms().forEach(room ->
                room.getPlayers().forEach(player ->
                        sendToPlayer(player.getId(), HOURLY_MSG)));
    }

    private void maybeBroadcastRandomEvent() {
        if (rng.nextDouble() < BROADCAST_CHANCE) {
            String text = RANDOM_BROADCASTS.get(rng.nextInt(RANDOM_BROADCASTS.size()));
            roomService.getRooms().forEach(room ->
                    room.getPlayers().forEach(player ->
                            sendToPlayer(player.getId(), text)));
        }
    }

    private void sendToPlayer(UUID playerId, String text) {
        messagingTemplate.convertAndSend(
                "/topic/" + playerId + "/random-event",
                new EventPayload(text)
        );
    }

    private void maybeSendGlassReminders() {
        Instant now = Instant.now();
        glassWindows.forEach((playerId, expiresAt) -> {
            if (expiresAt.isBefore(now)) {
                glassWindows.remove(playerId);              // window closed
            } else if (rng.nextDouble() < GLASS_REMINDER_CHANCE) {
                sendToPlayer(playerId,
                        "Your glass should be empty! If it isn't, drink it and refill.");
            }
        });
    }


    private record EventPayload(String text) { }

}

