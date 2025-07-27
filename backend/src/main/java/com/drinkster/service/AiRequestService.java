package com.drinkster.service;

import com.drinkster.model.Challenge;
import com.drinkster.model.Penalty;
import com.drinkster.model.enums.ChallengeType;
import com.drinkster.model.enums.Difficulty;
import com.drinkster.model.enums.Sex;
import com.fasterxml.jackson.databind.JsonNode;
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
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AiRequestService {

    private static final String SFW_URL = "https://api.openai.com/v1/chat/completions";
    private static final String NSFW_URL = "https://openrouter.ai/api/v1/chat/completions";
    private static final String SFW_MODEL = "gpt-4.1-mini";
    private static final String NSFW_MODEL = "@preset/drinkster-nsfw";



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
        String path = nsfw ? "classpath:prompts/nsfw_prompt.txt"
                : "classpath:prompts/sfw_prompt.txt";

        Resource resource = resourceLoader.getResource(path);

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
            String template = reader.lines().collect(Collectors.joining("\n"));
            return template.replace("{{difficulty}}", difficulty.toLowerCase());
        } catch (IOException e) {
            logger.error("Error reading prompt file: {}", path, e);
            return "";
        }
    }

    public Challenge getSfwChallenge(Difficulty difficulty) {
        String apiKey = System.getenv("SFW_API_KEY");
        String prompt = getPrompt(difficulty.toString(), false);
        return getChallengeObject(sendPostRequest(SFW_URL, apiKey, SFW_MODEL, prompt));
    }

    public Challenge getNsfwChallenge() { // can only be extreme, no need for parameter
        String apiKey = System.getenv("NSFW_API_KEY");
        String prompt = getPrompt("extreme", true);
        return getChallengeObject(sendPostRequest(NSFW_URL, apiKey, NSFW_MODEL, prompt));
    }

    private String sendPostRequest(String url, String apiKey, String model, String prompt) {
        try (HttpClient client = HttpClient.newHttpClient()) {
            ObjectNode root = objectMapper.createObjectNode();
            root.put("model", model);
            root.put("temperature", 1.10);

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

    public Challenge getChallengeObject(String body) {
        try {
            logger.debug("Parsing AI response body: {}", body);
            // Parse the overall AI response
            JsonNode root = objectMapper.readTree(body);
            String content = root.path("choices").get(0).path("message").path("content").asText();

            // Strip code fences if present
            String json = content.replaceAll("```json", "").replaceAll("```", "").trim();
            ObjectNode node = (ObjectNode) objectMapper.readTree(json);

            // Map to Challenge
            Challenge challenge = new Challenge();
            challenge.setText(node.path("text").asText());
            challenge.setDifficulty(Difficulty.valueOf(node.path("difficulty").asText().toUpperCase()));
            challenge.setPlayers(node.path("players").asInt());
            //sexes: "All" * number of players
            challenge.setSexes(Collections.nCopies(challenge.getPlayers(), Sex.ALL));
            challenge.setSips(node.path("sips").asInt());
            challenge.setType(ChallengeType.valueOf(node.path("type").asText().toUpperCase()));

            // Handle optional penalty
            if (node.has("penalty")) {
                JsonNode pen = node.path("penalty");
                Penalty penalty = new Penalty();
                penalty.setText(pen.path("text").asText());
                penalty.setRounds(pen.path("rounds").asInt());
                challenge.setPenalty(penalty);
            }

            // Mark as AI-generated
            challenge.setAi(true);
            return challenge;
        } catch (IOException e) {
            logger.error("Error parsing AI response: {}", body, e);
            // Return a fallback challenge instead of null
            Challenge fallback = new Challenge();
            fallback.setText("Error loading challenge. Drink 3 sips!");
            fallback.setDifficulty(Difficulty.EASY);
            fallback.setPlayers(1);
            fallback.setSexes(List.of(Sex.ALL));
            fallback.setSips(3);
            fallback.setType(ChallengeType.YOU_DRINK);
            fallback.setAi(true);
            return fallback;
        }

    }

}

