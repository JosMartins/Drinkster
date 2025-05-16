package com.drinkster.controller;


import com.drinkster.dto.request.CreateChallengeRequest;
import com.drinkster.model.Challenge;
import com.drinkster.model.Penalty;
import com.drinkster.model.enums.ChallengeType;
import com.drinkster.model.enums.Difficulty;
import com.drinkster.model.enums.Sex;
import com.drinkster.service.ChallengeService;

import java.net.URI;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/challenges")
public class ChallengeRestController {

    private final ChallengeService challengeService;


    public ChallengeRestController(ChallengeService challengeService) {
        this.challengeService = challengeService;
    }

    //don't expose yet because we don't validate the request
    //@PostMapping("/add")
    public ResponseEntity<?> addChallenge(@RequestBody CreateChallengeRequest challengeRequest) {

        // Validate the request
        //TODO

        List<Sex> challengeSexes = Arrays.stream(challengeRequest.sexes())
                .map(Sex::valueOf)
                .collect(Collectors.toList());

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

        if (saved != null) {
            return ResponseEntity.created(URI.create("/created"))
                                        .body(saved.getId().toString());
        } else {
            return ResponseEntity.badRequest()
                                        .body("Challenge could not be created");
        }


    }
}
