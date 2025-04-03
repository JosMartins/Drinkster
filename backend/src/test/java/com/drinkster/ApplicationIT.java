package com.drinkster;

import com.drinkster.model.Challenge;
import com.drinkster.model.enums.Difficulty;
import com.drinkster.model.enums.Sex;
import com.drinkster.repository.ChallengeRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class ApplicationIT {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ChallengeRepository challengeRepository;

    @Test
    void contextLoads() {
        assertThat(port).isGreaterThan(0);
    }
/* REST API INTEGRATION TESTS - not needed for now
    @Test
    void applicationIntegrationTest() {

        challengeRepository.deleteAll();

        Challenge challenge = new Challenge(
                "Integration Test Challenge",
                Difficulty.HARD,
                List.of(Sex.ALL),
                0,
                8
        );

        ResponseEntity<Challenge> createResponse = restTemplate.postForEntity(
                "http://localhost:" + port + "/api/challenges",
                challenge,
                Challenge.class
        );

        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        Challenge createdChallenge = createResponse.getBody();
        assertThat(createdChallenge).isNotNull();
        assertThat(createdChallenge.getText()).isEqualTo("Integration Test Challenge");

        // Get All Challenges
        ResponseEntity<Challenge[]> getAllResponse = restTemplate.getForEntity(
                "http://localhost:" + port + "/api/challenges",
                Challenge[].class
        );

        assertThat(getAllResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        Challenge[] challenges = getAllResponse.getBody();
        assertThat(challenges).isNotNull();
        assertThat(challenges.length).isEqualTo(1);

        // Check for persistence
        List<Challenge> savedChallenges = challengeRepository.findAll();
        assertThat(savedChallenges).hasSize(1);
        assertThat(savedChallenges.getFirst().getText()).isEqualTo("Integration Test Challenge");
    }
    */
}