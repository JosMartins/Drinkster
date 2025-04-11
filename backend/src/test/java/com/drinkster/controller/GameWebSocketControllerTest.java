package com.drinkster.controller;

import com.drinkster.dto.request.JoinRequest;
import com.drinkster.dto.response.JoinResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import org.springframework.web.socket.sockjs.client.SockJsClient;
import org.springframework.web.socket.sockjs.client.WebSocketTransport;

import java.lang.reflect.Type;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.awaitility.Awaitility.await;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GameWebSocketControllerTest {

    @LocalServerPort
    private Integer port;

    private WebSocketStompClient stompClient;

    @BeforeEach
    void setup() {
        this.stompClient = new WebSocketStompClient(new SockJsClient(List.of(new WebSocketTransport(new StandardWebSocketClient()))));
        stompClient.setMessageConverter(new MappingJackson2MessageConverter());
    }

    @Test
    void whenJoinRoomMessageSent_thenReturnSessionId() throws Exception {
        StompSession session = stompClient.connectAsync("ws://localhost:" + port + "/ws", new StompSessionHandlerAdapter() {}).get(1, TimeUnit.SECONDS);

        AtomicReference<String> sessionId = new AtomicReference<>();
        session.subscribe("/topic/room-events", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return JoinResponse.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                JoinResponse response = (JoinResponse) payload;
                sessionId.set(response.sessionId());
            }
        });

        session.send("/app/join-room", new JoinRequest("123"));

        await().atMost(2, TimeUnit.SECONDS).untilAsserted(() -> {
            assertThat(sessionId.get()).isNotNull();
        });
    }
}