package com.drinkster.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Set;

@Service
public class ApiKeyService {

    private final Set<String> validApiKeys;
    private final SecureRandom random = new SecureRandom();

    public ApiKeyService(@Value("${drinkster.api.keys}") String[] keys) {
        this.validApiKeys = Set.of(keys);
    }

    public boolean isValidApiKey(String apiKey) {
        return validApiKeys.contains(apiKey);
    }

    public String generateApiKey() {
        byte[] key = new byte[16]; // 128 bits
        random.nextBytes(key);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(key);
    }
}
