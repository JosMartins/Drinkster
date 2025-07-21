package com.drinkster.service;

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
        String response = aiRequestService.getSfwChallenge("hard");

        assertNotNull(response);
        assertFalse(response.isEmpty());

        System.out.println("SFW AI Response: " + response);
    }

    @Test
    void testNsfwChallengeRequest() {
        String response = aiRequestService.getNsfwChallenge(); //can only be extreme

        assertNotNull(response);
        assertFalse(response.isEmpty());

        System.out.println("NSFW AI Response: " + response);
    }

}
