package com.drinkster.controller;


import com.drinkster.dto.request.CreateChallengeRequest;
import com.drinkster.model.Challenge;
import com.drinkster.model.Penalty;
import com.drinkster.model.enums.ChallengeType;
import com.drinkster.model.enums.Difficulty;
import com.drinkster.model.enums.Sex;
import com.drinkster.service.ChallengeService;

import java.net.URI;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Validated
@RestController
@RequestMapping("/api/challenges")
public class ChallengeRestController {
    private static final String API_KEY_HEADER = "X-API-Key";
    // This is a placeholder for the actual API key validation logic (remove ASAP)
    private static final String VALID_API_KEY = "secure-api-key";

    private final ChallengeService challengeService;

    private final Map<String, Instant> challengeLock = new ConcurrentHashMap<>();
    private final TaskScheduler taskScheduler;


    public ChallengeRestController(ChallengeService challengeService, TaskScheduler taskScheduler) {
        this.challengeService = challengeService;
        this.taskScheduler = taskScheduler;
    }

    @PostMapping
    public ResponseEntity<?> addChallenge(
            @RequestHeader(name = API_KEY_HEADER) String apiKey,
            @Valid @RequestBody CreateChallengeRequest challengeRequest) {

        String requestFingerprint = apiKey + "-" + challengeRequest.text().hashCode();

        if (challengeLock.containsKey(requestFingerprint)) {
            return ResponseEntity.status(429).body("Duplicate request detected");
        }


        if (!VALID_API_KEY.equals(apiKey)) {
            return ResponseEntity.status(401).body("Invalid API key");
        }

        try {
            challengeLock.put(requestFingerprint, Instant.now());

            List<Sex> challengeSexes;
            if (challengeRequest.sexes() == null) {
                challengeSexes = Arrays.stream(challengeRequest.sexes())
                                   .map(Sex::valueOf)
                                   .collect(Collectors.toList());
            } else {
                challengeSexes = new ArrayList<>();
            }


            Challenge newChallenge = new Challenge(
                    challengeRequest.text(),
                    Difficulty.valueOf(challengeRequest.difficulty()),
                    challengeSexes,
                    challengeRequest.players(),
                    challengeRequest.sips(),
                    ChallengeType.valueOf(challengeRequest.type()),
                    new Penalty(challengeRequest.penalty().text(), challengeRequest.penalty().rounds())
            );

            Challenge saved = challengeService.save(newChallenge);

            return ResponseEntity.created(URI.create("/challenges/" + saved.getId()))
                    .body(saved);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body("Invalid enum value: " + e.getMessage());
        } finally {
            taskScheduler.schedule(() ->
                            challengeLock.remove(requestFingerprint),
                    Instant.now().plusSeconds(30)
            );
        }
    }
}
