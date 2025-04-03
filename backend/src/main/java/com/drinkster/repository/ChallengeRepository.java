package com.drinkster.repository;

import com.drinkster.model.Challenge;
import com.drinkster.model.enums.Difficulty;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface ChallengeRepository extends JpaRepository<Challenge, Long> {

    Challenge findByText(String text);

    List<Challenge> findByDifficulty(Difficulty difficulty);

    void deleteByText(String text);
}
