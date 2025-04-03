package com.drinkster.config;

import com.drinkster.model.Challenge;
import com.drinkster.model.enums.Difficulty;
import com.drinkster.model.enums.Sex;
import com.drinkster.repository.ChallengeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final ChallengeRepository challengeRepo;

    @Override
    public void run(String... args) throws Exception {
        if (challengeRepo.count() == 0) {
            challengeRepo.saveAll(List.of(
                    new Challenge("Drink 4 sips.", Difficulty.EASY, List.of(Sex.ALL), 0, 4)
            ));
        }

    }
}
