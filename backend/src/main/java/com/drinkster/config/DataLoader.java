package com.drinkster.config;

import com.drinkster.model.Challenge;
import com.drinkster.model.DifficultyValues;
import com.drinkster.model.GameRoom;
import com.drinkster.model.Player;
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
                                "Drink 4 sips.",
                                Difficulty.EASY,
                                List.of(Sex.ALL),
                                0,
                                4
                        )
                );
            }

            // Create a test room for frontend testing
            Player testAdmin = new Player(
                    "Test Admin",
                    Sex.ALL,
                    new DifficultyValues(),
                    true,
                    "test-socket-id"
            );

            GameRoom testRoom = roomService.createRoom(
                    "Test Room",
                    false,  // not private
                    "",     // no password
                    testAdmin,
                    RoomMode.NORMAL,
                    10,     // remember count
                    true    // show challenges
            );

            System.out.println("Created test room with ID: " + testRoom.getId());
        };
    }
}