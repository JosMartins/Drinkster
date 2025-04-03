package com.drinkster.config;

import com.drinkster.model.Challenge;
import com.drinkster.model.enums.Difficulty;
import com.drinkster.model.enums.Sex;
import com.drinkster.repository.ChallengeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataLoader {

    @Bean
    public CommandLineRunner initDatabase(ChallengeRepository challengeRepo) {
        return args -> {
            if (challengeRepo.count() == 0) {
                challengeRepo.save(
                        new Challenge(
                                "Drink 4 sips.",
                                Difficulty.EASY,
                                List.of(Sex.ALL),
                                0,
                                4
                        )
                );
            }
        };
    }
}