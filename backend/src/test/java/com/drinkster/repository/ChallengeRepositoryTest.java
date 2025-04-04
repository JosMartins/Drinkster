package com.drinkster.repository;

import com.drinkster.model.Challenge;
import com.drinkster.model.enums.Difficulty;
import com.drinkster.model.enums.Sex;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class ChallengeRepositoryTest {

    @Autowired
    private ChallengeRepository challengeRepo;

    private Challenge challenge1;

    @BeforeEach
    void setUp() {

        challenge1 = new Challenge(
                "Test Challenge 1",
                Difficulty.EASY,
                List.of(Sex.ALL),
                0,
                3
        );

        Challenge challenge2 = new Challenge(
                "Test Challenge 2",
                Difficulty.MEDIUM,
                List.of(Sex.MALE),
                1,
                4
        );

        challengeRepo.saveAll(List.of(challenge1, challenge2));
    }

    @AfterEach
    void tearDown() {
        challengeRepo.deleteAll();
    }

    @Test
    void whenFindById_thenReturnChallenge() {
        Challenge found = challengeRepo.findById(challenge1.getId()).orElse(null);
        assertThat(found).isNotNull();
        assertThat(found.getText()).isEqualTo("Test Challenge 1");
    }

    @Test
    void whenFindByText_thenReturnChallenge() {
        Challenge found = challengeRepo.findByText("Test Challenge 2");
        assertThat(found).isNotNull();
        assertThat(found.getDifficulty()).isEqualTo(Difficulty.MEDIUM);
    }

    @Test
    void whenFindByDifficulty_thenReturnChallenges() {
        List<Challenge> found = challengeRepo.findByDifficulty(Difficulty.EASY);
        assertThat(found).hasSize(1);
        assertThat(found.getFirst().getText()).isEqualTo("Test Challenge 1");
    }

    @Test
    void whenDeleteById_thenRemoveChallenge() {
        challengeRepo.deleteById(challenge1.getId());
        assertThat(challengeRepo.findById(challenge1.getId())).isEmpty();
        assertThat(challengeRepo.count()).isEqualTo(1);
    }

    @Test
    void whenDeleteByText_thenRemoveChallenge() {
        challengeRepo.deleteByText("Test Challenge 2");
        assertThat(challengeRepo.findByText("Test Challenge 2")).isNull();
        assertThat(challengeRepo.count()).isEqualTo(1);
    }
}