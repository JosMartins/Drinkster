package com.drinkster.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Configures the message broker for WebSocket communication.
     * This method sets up the message broker to handle messages sent to specific destinations.
     *
     * @param registry the MessageBrokerRegistry to configure
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic"); // Where messages are sent
        registry.setApplicationDestinationPrefixes("/app"); // Where clients send messages
        registry.setUserDestinationPrefix("/user"); // For user-specific messages
    }


    /**
     * Registers the STOMP endpoints for WebSocket communication.
     * This method defines the endpoint that clients will use to connect to the WebSocket server.
     *
     * @param registry the StompEndpointRegistry to register endpoints
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();

    }
}