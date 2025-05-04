package com.drinkster.config;

import com.drinkster.model.*;
import com.drinkster.model.enums.ChallengeType;
import com.drinkster.model.enums.Difficulty;
import com.drinkster.model.enums.RoomMode;
import com.drinkster.model.enums.Sex;
import com.drinkster.repository.ChallengeRepository;
import com.drinkster.service.RoomService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataLoader {

    @Bean
    public CommandLineRunner initDatabase(ChallengeRepository challengeRepo,
                                          RoomService roomService) {
        return args -> {
            if (challengeRepo.count() == 0) {
                challengeRepo.save(
                        new Challenge(
                                "Drink {sips} sips.",
                                Difficulty.EASY,
                                List.of(),
                                0,
                                4,
                                ChallengeType.YOU_DRINK
                        )
                );
                challengeRepo.save(
                        new Challenge(
                                "{Player} and {Player2} Drink {sips} sips.",
                                Difficulty.MEDIUM,
                                List.of(Sex.ALL, Sex.ALL),
                                0,
                                4,
                                ChallengeType.BOTH_DRINK
                        )
                );
                challengeRepo.save(
                        new Challenge(
                                "{Player} and {Player2} do Penalty",
                                Difficulty.EASY,
                                List.of(Sex.MALE, Sex.ALL),
                                2,
                                0,
                                ChallengeType.YOU_DRINK,
                                new Penalty("Test penalty", 2))
                );
            }

            // Create a test room for frontend testing
            Player testAdmin = new Player(
                    "Test Admin",
                    Sex.MALE,
                    new DifficultyValues(),
                    true,
                    "test-socket-id"
            );

            GameRoom testRoom = roomService.createRoom(
                    "Test Room",
                    false,               // not private
                    "",                          // no password
                    testAdmin,
                    RoomMode.NORMAL,
                    10,       // remember count
                    true                        // show challenges
            );

            System.out.println("Created test room with ID: " + testRoom.getId());
        };
    }
}