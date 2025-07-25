package com.drinkster.service;

import com.drinkster.model.Challenge;
import com.drinkster.model.enums.Difficulty;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
class AiRequestServiceTest {

    @Autowired
    private AiRequestService aiRequestService;

    @Test
    void testSfwChallengeRequest() {
        Challenge easyChallenge = aiRequestService.getSfwChallenge(Difficulty.EASY);
        assertNotNull(easyChallenge);
        System.out.println("Easy Challenge: " + easyChallenge);

        Challenge mediumChallenge = aiRequestService.getSfwChallenge(Difficulty.MEDIUM);
        assertNotNull(mediumChallenge);
        System.out.println("Medium Challenge: " + mediumChallenge);
        Challenge hardChallenge = aiRequestService.getSfwChallenge(Difficulty.HARD);
        assertNotNull(hardChallenge);
        System.out.println("Hard Challenge: " + hardChallenge);

    }

    @Test
    void testNsfwChallengeRequest() {
        Challenge extremeChallenge = aiRequestService.getNsfwChallenge(); //can only be extreme

        assertNotNull(extremeChallenge);
        System.out.println("Extreme Challenge: " + extremeChallenge);
    }

}
