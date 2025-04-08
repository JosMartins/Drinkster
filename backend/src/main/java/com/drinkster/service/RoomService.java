package com.drinkster.service;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

@Service
public class RoomService {


    @CacheEvict(value = "rooms", key = "#roomId")
    public void endGame(String roomId) {
        // Logic to end the game and clear the cache
        // This method will be called when a game ends, and it will clear the cache for the specified roomId
    }
}
