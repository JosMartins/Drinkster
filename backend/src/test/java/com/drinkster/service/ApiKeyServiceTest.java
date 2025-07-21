// ApiKeyServiceTest.java
package com.drinkster.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class ApiKeyServiceTest {

    @InjectMocks
    private ApiKeyService apiKeyService = new ApiKeyService(new String[]{"key1", "key2"});

    @Test
    void isValidApiKey_returnsTrueForValidKey() {
        assertTrue(apiKeyService.isValidApiKey("key1"));
        assertTrue(apiKeyService.isValidApiKey("key2"));
    }

    @Test
    void isValidApiKey_returnsFalseForInvalidKey() {
        assertFalse(apiKeyService.isValidApiKey("invalid"));
        assertFalse(apiKeyService.isValidApiKey(""));
        assertFalse(apiKeyService.isValidApiKey(null));
    }

    @Test
    void generateApiKey_returnsValidFormat() {
        String key = apiKeyService.generateApiKey();
        assertNotNull(key);
        assertEquals(22, key.length()); // 16 bytes base64 encoded without padding
        assertDoesNotThrow(() -> Base64.getUrlDecoder().decode(key));
    }

    @Test
    void generateApiKey_returnsUniqueValues() {
        String key1 = apiKeyService.generateApiKey();
        String key2 = apiKeyService.generateApiKey();
        assertNotEquals(key1, key2);
    }
}