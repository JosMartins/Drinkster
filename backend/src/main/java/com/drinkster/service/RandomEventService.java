package com.drinkster.service;

import com.drinkster.model.Player;
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
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class RandomEventService {
    public static final int SIPS_PER_GLASS = 20;
    private static final Duration GLASS_WINDOW         = Duration.ofMinutes(3);
    private static final Duration GLASS_POLL_INTERVAL  = Duration.ofMinutes(1);
    private static final double   GLASS_REMINDER_CHANCE = 0.32; // 32 %


    private static final String HOURLY_MSG = "It's been an hour! Drink a shot.";
    private static final double BROADCAST_CHANCE = 0.15;          // 15 %
    private static final List<String> RANDOM_BROADCASTS = List.of(
            "Touch the floor and drink 2 sips!",
            "Everyone swap seats and drink 2 sip.",
            "If your phone is on the table, drink 2 sips!",
            "If you are wearing a watch, drink 2 sips!",
            "If you're wearing black, drink 2 sips!",
            "Whoever’s birthday is closest gives 2 sips!",
            "If your drink is more than half full, take 2 big sips!",
            "Quick! Point at someone. The last person to do it drinks 2 sips!",
            "Change your name for the next round. If someone forgets it, drink 3 sips!",
            "Switch drinks with the person on your right (if you dare)."
    );

    private final Map<Player, Instant> glassWindows = new ConcurrentHashMap<>();

    private final RoomService roomService;
    private final SimpMessagingTemplate messagingTemplate;
    private final TaskScheduler taskScheduler;
    private final Random rng = new Random();


    @PostConstruct
    public void init() {
        /* 1 ─ 45min “drink a shot” event */
        taskScheduler.scheduleAtFixedRate(this::sendHourlyEvent, Duration.ofMinutes(45));

        /* 2 ─ 3 % broadcast event every minute */
        taskScheduler.scheduleAtFixedRate(this::maybeBroadcastRandomEvent, Duration.ofMinutes(3));

        taskScheduler.scheduleAtFixedRate(this::maybeSendGlassReminders, GLASS_POLL_INTERVAL);


    }

    public void startGlassWindow(Player player) {
        glassWindows.put(player, Instant.now().plus(GLASS_WINDOW));
    }


    private void sendHourlyEvent() {
        roomService.getRooms().forEach(room ->
                room.getPlayers().forEach(player ->
                        sendToPlayer(player.getSocketId(), HOURLY_MSG)));
    }

    private void maybeBroadcastRandomEvent() {
        if (rng.nextDouble() < BROADCAST_CHANCE) {
            String text = RANDOM_BROADCASTS.get(rng.nextInt(RANDOM_BROADCASTS.size()));
            messagingTemplate.convertAndSend("/topic/random-event", new EventPayload(text));
        }
    }

    private void sendToPlayer(String sessionId, String text) {
        messagingTemplate.convertAndSendToUser(sessionId, "/queue/random-event",
                new EventPayload(text));
    }

    private void maybeSendGlassReminders() {
        Instant now = Instant.now();
        glassWindows.forEach((player, expiresAt) -> {
            if (expiresAt.isBefore(now)) {
                glassWindows.remove(player);              // window closed
            } else if (rng.nextDouble() < GLASS_REMINDER_CHANCE) {
                sendToPlayer(player.getSocketId(),
                        "Your glass should be empty or near it! If it isn't, drink it and refill.");
            }
        });
    }


    private record EventPayload(String text) { }

}

