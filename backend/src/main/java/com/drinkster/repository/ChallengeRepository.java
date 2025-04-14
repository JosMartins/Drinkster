package com.drinkster.repository;

import com.drinkster.model.Challenge;
import com.drinkster.model.enums.Difficulty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.lang.NonNull;

import java.util.List;
import java.util.UUID;


public interface ChallengeRepository extends JpaRepository<Challenge, UUID> {

    Challenge findByText(String text);
    List<Challenge> findByDifficulty(Difficulty difficulty);
    void deleteById(@NonNull UUID id);
    void deleteByText(String text);

    @Query(value = "SELECT * FROM challenge WHERE id NOT IN :excludeIds ORDER BY RAND() LIMIT 1", nativeQuery = true)
    Challenge findRandomChallengeExcluding(List<UUID> excludeIds);

    @Query(value = "SELECT * FROM challenge ORDER BY RAND() LIMIT 1", nativeQuery = true)
    Challenge findRandomChallenge();
}
