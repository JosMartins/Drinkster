package com.drinkster.repository;


import com.drinkster.model.Challenge;
import com.drinkster.model.enums.Difficulty;
import com.drinkster.model.enums.Sex;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class ChallengeRepositoryTest {

    @Autowired
    private ChallengeRepository challengeRepo;

    @Test
    void whenSaved_thenFindsByDifficulty() {
        Challenge challenge = new Challenge(
                "testChallenge",
                Difficulty.MEDIUM,
                List.of(Sex.ALL),
                0,
                5
        );

        challengeRepo.save(challenge);

        List<Challenge> found = challengeRepo.findByDifficulty(Difficulty.MEDIUM);
        assertThat(found).hasSize(1);
    }
}