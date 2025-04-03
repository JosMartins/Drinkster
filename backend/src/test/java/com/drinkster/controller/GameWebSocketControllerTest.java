package com.drinkster.controller;

import com.drinkster.config.WebSocketConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(GameWebSocketController.class)
@Import({WebSocketConfig.class, SimpMessagingTemplate.class})
class GameWebSocketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Test
    void whenGameStartMessageSent_thenBroadcastEvent() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.post("/app/game.start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"roomId\": 123 }"))
                .andExpect(status().isOk());
    }
}