// ChallengeServiceTest.java
package com.drinkster.service;

import com.drinkster.model.Challenge;
import com.drinkster.model.enums.Difficulty;
import com.drinkster.repository.ChallengeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChallengeServiceTest {

    @Mock
    private ChallengeRepository challengeRepository;

    @InjectMocks
    private ChallengeService challengeService;

    private final UUID challengeId = UUID.randomUUID();
    private final Challenge challenge = new Challenge();

    @BeforeEach
    void setup() {
        challenge.setId(challengeId);
        challenge.setDifficulty(Difficulty.MEDIUM);
    }

    @Test
    void getRandomChallenge_withExclusionsAndDifficulty() {
        List<UUID> excludeIds = List.of(UUID.randomUUID());
        when(challengeRepository.findRandomChallengeExcludingWithDifficulty(excludeIds, Difficulty.HARD.toString()))
                .thenReturn(challenge);

        Challenge result = challengeService.getRandomChallenge(excludeIds, Difficulty.HARD);
        assertEquals(challenge, result);
    }

}