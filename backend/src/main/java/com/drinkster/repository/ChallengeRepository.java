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
    int countByDifficulty(Difficulty difficulty);

    @Query(value = "SELECT COUNT(c) FROM Challenge c")
    int countAll();

    @Query(value = "SELECT * FROM challenges ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    Challenge findRandomChallenge();

    @Query(value = "SELECT * FROM challenges WHERE id NOT IN :excludeIds AND difficulty = :difficulty ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    Challenge findRandomChallengeExcludingWithDifficulty(List<UUID> excludeIds, String difficulty);

    @Query(value = "SELECT * FROM challenges WHERE id NOT IN :excludeIds ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    Challenge findRandomChallengeExcluding(List<UUID> excludeIds);

    @Query(value = "SELECT * FROM challenges WHERE difficulty = :difficulty ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    Challenge findRandomChallengeByDifficulty(String difficulty);
}
