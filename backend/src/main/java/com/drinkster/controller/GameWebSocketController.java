package com.drinkster.controller;

import com.drinkster.dto.GameStartMessage;
import com.drinkster.dto.StartRequest;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import javax.naming.ldap.StartTlsRequest;

@Controller
public class GameWebSocketController {

    @MessageMapping("/game.start")
    @SendTo("/topic/game-events")
    public GameStartMessage handleGameStart(StartRequest request) {
        return new GameStartMessage("Game Started for room " + request.roomId());
    }
}
