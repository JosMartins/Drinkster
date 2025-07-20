package com.drinkster.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

@Service
public class AiRequestService {
    private static final String SFW_PROMPT_FILE = "classpath:prompts/sfw_prompts.txt";
    private static final String NSFW_PROMPT_FILE = "classpath:prompts/nsfw_prompts.txt";

    private static final String SFW_URL = "https://api.openai.com/v1/chat/completions";
    private static final String NSFW_URL = "https://openrouter.ai/api/v1/chat/completions";
    private static final String SFW_MODEL = "gpt-4.1-mini";
    private static final String NSFW_MODEL = "gryphe/mythomax-l2-13b";



    private static final Logger logger = LoggerFactory.getLogger(AiRequestService.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private final ResourceLoader resourceLoader;


    public AiRequestService(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    /**
     * Retrieves a prompt based on the difficulty and whether it is NSFW or SFW.
     *
     * @param difficulty the difficulty level of the prompt
     * @param nsfw       true if the prompt is NSFW, false if it is SFW
     * @return a formatted prompt string
     */
    public String getPrompt(String difficulty, boolean nsfw) {
        String path = nsfw ? NSFW_PROMPT_FILE : SFW_PROMPT_FILE;
        Resource resource = resourceLoader.getResource(path);

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
            String template = reader.lines().collect(Collectors.joining("\n"));
            return template.replace("{{difficulty}}", difficulty.toLowerCase());
        } catch (IOException e) {
            logger.error("Error reading prompt file: {}", path, e);
            return "";
        }
    }

    public String getSfwChallenge(String difficulty) {
        String apiKey = System.getenv("OPENAI_API_KEY");
        String prompt = getPrompt(difficulty, false);
        return sendPostRequest(SFW_URL, apiKey, SFW_MODEL, prompt);
    }

    public String getNsfwChallenge(String difficulty) {
        String apiKey = System.getenv("OPENROUTER_API_KEY");
        String prompt = getPrompt(difficulty, true);
        return sendPostRequest(NSFW_URL, apiKey, NSFW_MODEL, prompt);
    }

    private String sendPostRequest(String url, String apiKey, String model, String prompt) {
        try (HttpClient client = HttpClient.newHttpClient()) {
            ObjectNode root = objectMapper.createObjectNode();
            root.put("model", model);
            root.put("temperature", 0.8);

            ObjectNode message = objectMapper.createObjectNode();
            message.put("role", "user");
            message.put("content", prompt);

            root.putArray("messages").add(message);

            String requestBody = objectMapper.writeValueAsString(root);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            return response.body();
        } catch (IOException | InterruptedException e) {
            logger.error("Error sending request to AI API: {}", url, e);
            Thread.currentThread().interrupt();
            return "";
        }
    }

}

