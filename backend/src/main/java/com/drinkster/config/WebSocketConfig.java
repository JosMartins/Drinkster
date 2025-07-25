package com.drinkster.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.security.Principal;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketConfig.class);
    @Autowired
    private SessionIdHandshakeInterceptor sessionIdHandshakeInterceptor; // Interceptor to handle session IDs
    private final Map<String, String> sessionUserMap = new ConcurrentHashMap<>(); // Track session-user mappings

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new PrincipalChannelInterceptor());
    }


        /**
         * Configures the message broker for WebSocket communication.
         * This method sets up the message broker to handle messages sent to specific destinations.
         *
         * @param registry the MessageBrokerRegistry to configure
         */
        @Override
        public void configureMessageBroker(MessageBrokerRegistry registry) {
            registry.enableSimpleBroker("/topic", "/queue");
            registry.setApplicationDestinationPrefixes("/app");
            registry.setUserDestinationPrefix("/user");
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
                .setAllowedOrigins("http://localhost:3000", "https://drinkster.zescripts.dev")
                .setAllowedOriginPatterns("*")
                .addInterceptors(sessionIdHandshakeInterceptor)
                .withSockJS();
    }

}